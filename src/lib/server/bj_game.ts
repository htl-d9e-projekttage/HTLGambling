import { buildDeck, calculateScore } from '$lib/utils';
import type { BlackjackCard } from '$lib/utils';
import { addMoney, getUserById } from './auth';
import { generateClientSeed, hmacSHA256 } from './utils';

export class BlackjackDeck {
	cards: BlackjackCard[];
	#clientSeed: string = generateClientSeed();
	#nonce: number = 0;

	constructor() {
		this.cards = buildDeck();
		this.shuffle();
	}

	deal(): BlackjackCard {
		const card = this.cards.pop();

		if (!card) {
			throw new Error('Deck is empty');
		}

		return card;
	}

	shuffle(): void {
		this.cards = this.cards.sort(() => this.genNum() - 0.5);
	}

	private genNum(): number {
		const hash = hmacSHA256(this.#clientSeed, this.#nonce);
		const first8Chars = hash.slice(0, 8);
		const randomNumber = parseInt(first8Chars, 16) / 0xFFFFFFFF; // Normalize to a number between 0 and 1
		this.#nonce++;
		return randomNumber; // Return a number between 0 and 1
	}
}

export class BlackjackPlayer {
	hand: BlackjackCard[] = [];
	score: number = 0;

	constructor() {
		this.updateScore();
	}

	canDraw(): boolean {
		return this.score < 21;
	}

	draw(card: BlackjackCard): void {
		if (this.canDraw()) {
			this.hand.push(card);
			this.updateScore();
		}
	}

	private updateScore(): void {
		this.score = calculateScore(this.hand);
	}
}

export class BlackjackDealer {
	hand: BlackjackCard[] = [];
	score: number = 0;
	#calcScore: number = 0;
	#hiddenCard: BlackjackCard | null = null;

	constructor() {
		this.updateScore();
	}

	shouldDraw(): boolean {
		return this.#calcScore < 17;
	}

	get calcScore(): number {
		return this.#calcScore;
	}

	draw(card: BlackjackCard, hidden = false): void {
		if (hidden) {
			this.#hiddenCard = card;
		} else {
			this.hand.push(card);
		}
		this.updateScore();
	}

	private updateScore(): void {
		this.score = calculateScore(this.hand);
		this.#calcScore = calculateScore(this.hand.concat(this.#hiddenCard ? [this.#hiddenCard] : []));
	}
	
	revealHiddenCard(): void {
		if (this.#hiddenCard) {
			this.hand.push(this.#hiddenCard);
			this.#hiddenCard = null;
			this.updateScore();
		}
	}
}

export class BlackjackGame {
	winner: BlackjackWinner = null;
	player: BlackjackPlayer;
	dealer: BlackjackDealer;
	deck: BlackjackDeck;
	turn: BlackjackTurn = null;
	bet: number = 0;
	balance: number = -1;
	userid: string = '';

	constructor() {
		this.deck = new BlackjackDeck();
		this.player = new BlackjackPlayer();
		this.dealer = new BlackjackDealer();
	}

	start(bet: number, userId: string): void {
		const user = getUserById(userId);
		this.bet = bet;
		this.balance = user?.money ?? -1;
		this.balance -= bet;
		this.userid = userId;
		this.deck = new BlackjackDeck();
		this.player = new BlackjackPlayer();
		this.dealer = new BlackjackDealer();
		this.winner = null;
		this.turn = 'Player';

		this.dealer.draw(this.deck.deal());
		this.dealer.draw(this.deck.deal(), true);
		this.player.draw(this.deck.deal());
		this.player.draw(this.deck.deal());

		this.checkBlackjack();
	}

	checkBlackjack(): void {
		if (this.player.score === 21) {
			this.winner = 'Player';
			this.endGame();
		}
	}

	checkBust(): void {
		if (this.player.score > 21) {
			this.winner = 'Dealer';
			this.endGame();
		}
	}

	calculateWinner(): void {
		if (this.dealer.calcScore > 21) {
			this.winner = 'Player';
		} else if (this.player.score > this.dealer.calcScore) {
			this.winner = 'Player';
		} else if (this.player.score < this.dealer.calcScore) {
			this.winner = 'Dealer';
		} else {
			this.winner = 'Draw';
		}
		this.endGame();
	}

	endGame(): void {
		// if the game is over, reveal the dealer's hidden card if any
		this.dealer.revealHiddenCard();
		if (this.winner === 'Player') {
			this.balance += this.bet * 2;
			addMoney(this.userid, this.bet);
		} else if (this.winner === 'Draw') {
			this.balance += this.bet;
		} else {
			addMoney(this.userid, -this.bet);
		}
		this.turn = null;
	}

	playerTurn(option: 'draw' | 'stop'): void {
		if (option === 'draw') {
			this.player.draw(this.deck.deal());
			this.checkBust();
		} else {
			this.dealerTurn();
		}
	}

	dealerTurn(): void {
		this.turn = 'Dealer';

		this.dealer.revealHiddenCard();

		while (this.dealer.shouldDraw()) {
			this.dealer.draw(this.deck.deal());
		}

		this.calculateWinner();
	}
}

export type BlackjackWinner = null | 'Player' | 'Dealer' | 'Draw';
export type BlackjackTurn = null | 'Player' | 'Dealer';
