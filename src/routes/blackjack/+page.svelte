<script lang="ts">
	import { Button, Heading, Input, Label, Spinner, Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { PageServerData } from './$types';
	import CardsDefinitions from '$lib/components/CardsDefinitions.svelte';
	import Card from '$lib/components/Card.svelte';
	import FallingMoney from '$lib/components/FallingMoney.svelte';

	let { data }: { data: PageServerData } = $props();

	export const game: any = writable(null);
	export const playerHand: any = writable([]);
	export const dealerHand: any = writable([]);
	export const winner = writable(null);
	export const turn = writable(null);
	export const balance = writable(data.user.money);
	let stake = $state(0);
	let loaded = $state(false);

	async function fetchGame() {
		const response = await fetch('/api/blackjack/game');
		const data = await response.json();
		updateGameState(data.game);
		loaded = true;
	}

	async function startGame() {
		const response = await fetch('/api/blackjack/game', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ bet: stake * 100 })
		});
		const data = await response.json();
		if (data.error) {
			alert(data.error);
			return;
		}
		updateGameState(data.game);
	}

	async function playerTurn(action: 'draw' | 'stop') {
		const response = await fetch('/api/blackjack/player-turn', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action })
		});
		const data = await response.json();
		updateGameState(data.game);
	}

	function deleteGame() {
		fetch('/api/blackjack/game', {
			method: 'DELETE'
		});
	}

	function updateGameState(newGameState: any) {
		if (!newGameState) return;

		game.set(newGameState);
		playerHand.set(newGameState.player.hand);
		dealerHand.set(newGameState.dealer.hand);
		winner.set(newGameState.winner);
		if (newGameState.winner) {
			turn.set(null);
			deleteGame();
		}
		turn.set(newGameState.turn);
		balance.set(newGameState.balance);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			startGame();
		}
		if (event.key === 'd' && $turn === 'Player') {
			playerTurn('draw');
		}
		if (event.key === 's' && $turn === 'Player') {
			playerTurn('stop');
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	onMount(fetchGame);
</script>

<main class="flex h-screen w-full flex-col items-center">
	<CardsDefinitions />

	{#if !loaded}
		<Spinner />
	{:else}
		{#if $winner === 'Player'}
			<FallingMoney />
		{/if}
		<p class="text-5xl font-bold">Balance: € {$balance / 100}</p>
		{#if $turn === null && $winner === null}
			<div class="flex flex-col">
				<Label for="stake">Enter your stake(€):</Label>
				<Input
					class="w-56 text-2xl ring-cyan-600"
					type="number"
					id="stake"
					bind:value={stake}
					min="1"
				/>
				<Button class="mt-2 select-none bg-cyan-600 dark:bg-primary-700" onclick={startGame}
					>Start Game</Button
				>
			</div>
		{:else}
			<section>
				<Heading tag="h2">Your Hand</Heading>
				<ul class="flex flex-wrap">
					{#each $playerHand as card}
						<Card name={card.displayName}></Card>
					{/each}
				</ul>
				<p>Score: {$game?.player.score}</p>

				<Heading tag="h2">Dealer's Hand</Heading>
				<ul class="flex flex-wrap">
					{#each $dealerHand as card}
						<Card name={card.displayName}></Card>
					{/each}
					{#if $dealerHand.length === 1}
						<Card name="hidden"></Card>
					{/if}
				</ul>
				<p>Score: {$game?.dealer.score}</p>

				{#if $turn === 'Player'}
					<div class="flex justify-center">
						<Button
							class="m-1 w-full bg-cyan-600 dark:bg-primary-700"
							onclick={() => playerTurn('draw')}>Draw</Button
						>
						<Button
							class="m-1 w-full bg-cyan-600 dark:bg-primary-700"
							onclick={() => playerTurn('stop')}>Stop</Button
						>
					</div>
				{/if}
			</section>
			<Modal open={$winner !== null}>
				<Heading tag="h2">
					{#if $winner === 'Player'}You Win!{/if}
					{#if $winner === 'Dealer'}Dealer Wins!{/if}
					{#if $winner === 'Draw'}It's a Draw!{/if}
				</Heading>
				<Input bind:value={stake} type="number" min="1" />
				<Button onclick={startGame}>Start New Game</Button>
			</Modal>
		{/if}
	{/if}
</main>
