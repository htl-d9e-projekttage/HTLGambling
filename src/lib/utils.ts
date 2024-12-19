const SUITES = ['heart', 'spade', 'diamond', 'club'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
const SCORES: Record<(typeof RANKS)[number], number> = {
	'1': 11,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'10': 10,
	jack: 10,
	queen: 10,
	king: 10
};

export type BlackjackCard = {
	suit: (typeof SUITES)[number];
	rank: (typeof RANKS)[number];
	displayName: string;
};

export const buildDeck = (): BlackjackCard[] => {
	const deck = [];
	for (const suit of SUITES) {
		for (const rank of RANKS) {
			deck.push({ suit, rank, displayName: `${suit}_${rank}` } as BlackjackCard);
		}
	}
	return deck;
};

export const calculateScore = (cards: BlackjackCard[]): number => {
	let score = 0;
	for (const card of cards) {
        // If the card is an ace and the score is over 21, treat the ace as a 1
        if (card.rank === '1' && score + SCORES[card.rank] > 21) {
            score += 1;
        } else {
		    score += SCORES[card.rank];
        }
	}
	return score;
};