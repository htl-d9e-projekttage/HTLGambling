<script lang="ts">
	import type { PageServerData } from './$types';
	import { Button, Input, Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte';

	let { data }: { data: PageServerData } = $props();

	if (!data) {
		throw new Error('No data provided');
	}

	let errorMsg = $state('');

	let user = data.props.user;
	let slot = data.props.currentSlotFace;

	let spinIsOnGoing = $state(false);

	let money = $state(data.props.user.money / 100);
	let bet = $state(5);

	let currentSlotFace = $state(slot);

	function spin() {
		if (spinIsOnGoing || bet > money) {
							errorMsg = 'Balance too low';
			return;
		}
		errorMsg = '';
		spinIsOnGoing = true;
		fetch(`/api/spin?bet=${(bet * 100)}`, {
			method: 'POST'
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error('Failed to spin');
				}
				return res.json();
			})
			.then((data) => {
				currentSlotFace = data;
				money -= bet;
				startIntervals();
			})
			.catch((err) => {
				errorMsg = 'Balance too low';
				spinIsOnGoing = false;
			});
	}

	let lane1Index = $state(0);
	let lane2Index = $state(0);
	let lane3Index = $state(0);

	let lane1Interval: string | number | NodeJS.Timeout | undefined,
		lane2Interval: string | number | NodeJS.Timeout | undefined,
		lane3Interval: string | number | NodeJS.Timeout | undefined;

	let lane1Done = $state(false);
	let lane2Done = $state(false);
	let lane3Done = $state(false);

	function startIntervals() {
		setTimeout(() => {
			lane1Done = false;
			lane1Interval = setInterval(() => {
				lane1Index = (lane1Index + 1) % (currentSlotFace.lane1.length - 2);
				if (lane1Done && currentSlotFace.winIndex1 == lane1Index) {
					clearInterval(lane1Interval);
					lane1Done = false;
				}
			}, 100);
		}, 1000); // Delay for lane1

		setTimeout(() => {
			lane2Interval = setInterval(() => {
				lane2Index = (lane2Index + 1) % (currentSlotFace.lane2.length - 2);
				if (lane2Done && currentSlotFace.winIndex2 == lane2Index) {
					clearInterval(lane2Interval);
					lane2Done = false;
				}
			}, 100);
		}, 2500); // Delay for lane2

		setTimeout(() => {
			lane3Interval = setInterval(() => {
				lane3Index = (lane3Index + 1) % (currentSlotFace.lane3.length - 2);
				if (lane3Done && currentSlotFace.winIndex3 == lane3Index) {
					clearInterval(lane3Interval);
					money += currentSlotFace.moneyWon / 100;
					if (currentSlotFace.moneyWon > 0) {
						errorMsg = `You won $${currentSlotFace.moneyWon / 100}`;
					}
					else {500
						errorMsg = 'You lost';
					}
					lane3Done = false;
					spinIsOnGoing = false;
					lane1Interval = undefined;
					lane2Interval = undefined;
					lane3Interval = undefined;
				}
			}, 100);
		}, 5000); // Delay for lane3

		let stop = Math.floor(Math.random() * 2000) + 3000; // Random time to stop all lanes
		setTimeout(() => {
			lane1Done = true;
		}, stop); // Random time to stop lane1
		stop = stop + Math.random() * 500;
		setTimeout(() => {
			lane2Done = true;
		}, stop); // Random time to stop lane2
		stop = stop + Math.random() * 1000;
		setTimeout(() => {
			lane3Done = true;
		}, stop); // Random time to stop lane3

	}

	//on spacebar press spinclearInterval
	window.addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			e.preventDefault();
			spin();
		}
	});
</script>

<div class="flex h-full items-center justify-center">
	<div id="file1">
		<img
			src={`/symbols/Logos/${currentSlotFace.lane1[lane1Index + 2]}${currentSlotFace.lane1[lane1Index + 2] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane1[lane1Index + 2]}
		/>
		<img
			src={`/symbols/Logos/${currentSlotFace.lane1[lane1Index + 1]}${currentSlotFace.lane1[lane1Index + 1] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane1[lane1Index + 1]}
		/>
		<img
			src={`/symbols/Logos/${currentSlotFace.lane1[lane1Index]}${currentSlotFace.lane1[lane1Index] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane1[lane1Index]}
		/>
	</div>
	<div id="file2">
		<img
			src={`symbols/Logos/${currentSlotFace.lane2[lane2Index + 2]}${currentSlotFace.lane2[lane2Index + 2] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane2[lane2Index + 2]}
		/>
		<img
			src={`symbols/Logos/${currentSlotFace.lane2[lane2Index + 1]}${currentSlotFace.lane2[lane2Index + 1] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane2[lane2Index + 1]}
		/>
		<img
			src={`symbols/Logos/${currentSlotFace.lane2[lane2Index]}${currentSlotFace.lane2[lane2Index] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane2[lane2Index]}
		/>
	</div>
	<div id="file3">
		<img
			src={`symbols/Logos/${currentSlotFace.lane3[lane3Index + 2]}${currentSlotFace.lane3[lane3Index + 2] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane3[lane3Index + 2]}
		/>
		<img
			src={`symbols/Logos/${currentSlotFace.lane3[lane3Index + 1]}${currentSlotFace.lane3[lane3Index + 1] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane3[lane3Index + 1]}
		/>
		<img
			src={`symbols/Logos/${currentSlotFace.lane3[lane3Index]}${currentSlotFace.lane3[lane3Index] == 'linux' ? '.gif' : '.svg'}`}
			alt={currentSlotFace.lane3[lane3Index]}
		/>
	</div>
</div>
<p>Money: ${money}</p>
<input bind:value={bet} min={1} max={money} type="number" class="text-black"/> <br>
<Button disabled={spinIsOnGoing} on:click={spin}>
	{spinIsOnGoing ? 'Spinning...' : 'Spin'}
</Button>
{#if errorMsg}
	<p>{errorMsg}</p>
{/if}
<style>
	img {
		width: 250px;
		height: 250px;
	}
</style>
