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

	let lastStart = $state(false);
	let currentSlotFace = $state(slot);


	let borderColor1:undefined|string = $state(undefined);
	let borderColor2:undefined|string = $state(undefined);
	let borderColor3:undefined|string = $state(undefined);
	let borderColor4:undefined|string = $state(undefined);
	let borderColor5:undefined|string = $state(undefined);
	let borderColor6:undefined|string = $state(undefined);
	let borderColor7:undefined|string = $state(undefined);
	let borderColor8:undefined|string = $state(undefined);
	let borderColor9:undefined|string = $state(undefined);

	function updateColor(colorMap: string[][][], index = 0) {
		borderColor1 = colorMap[index][0][0];
		borderColor2 = colorMap[index][0][1];
		borderColor3 = colorMap[index][0][2];
		borderColor4 = colorMap[index][1][0];
		borderColor5 = colorMap[index][1][1];
		borderColor6 = colorMap[index][1][2];
		borderColor7 = colorMap[index][2][0];
		borderColor8 = colorMap[index][2][1];
		borderColor9 = colorMap[index][2][2];
	}

	function spin() {
		if (spinIsOnGoing || bet > money) {
							errorMsg = 'Balance too low';
			return;
		}
		borderColor1 = undefined;
		borderColor2 = undefined;
		borderColor3 = undefined;
		borderColor4 = undefined;
		borderColor5 = undefined;
		borderColor6 = undefined;
		borderColor7 = undefined;
		borderColor8 = undefined;
		borderColor9 = undefined;
		
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
				if (rotateInterval){
					clearInterval(rotateInterval);

				}
				currentSlotFace = data;
				money -= bet;
				money = Math.round(money * 100) / 100;
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

	let stopTimer: string | number | NodeJS.Timeout | undefined;

	let rotateInterval: string | number | NodeJS.Timeout | undefined;

	function startIntervals() {
		setTimeout(() => {
			lane1Done = false;
			lane1Interval = setInterval(() => {
				lane1Index = (lane1Index + 1) % (currentSlotFace.lane1.length - 2);
				if (lane1Done && currentSlotFace.winIndex1 == lane1Index) {
					clearInterval(lane1Interval);
					lane1Done = false;
				}
			}, 50);
		}, 1); // Delay for lane1

		setTimeout(() => {
			lane2Interval = setInterval(() => {
				lane2Index = (lane2Index + 1) % (currentSlotFace.lane2.length - 2);
				if (lane2Done && currentSlotFace.winIndex2 == lane2Index) {
					clearInterval(lane2Interval);
					lane2Done = false;
				}
			}, 50);
		}, 500); // Delay for lane2

		setTimeout(() => {
			lastStart = true;
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
					lastStart = false;
					isStopping = false;
					rotateInterval = undefined;
					if (currentSlotFace.combo > 0){
						let i = 0;
						rotateInterval = setInterval(() => {
							console.log(i % currentSlotFace.combo + 1);
							updateColor(currentSlotFace.borders, i % (currentSlotFace.combo + 1));
							i++;
						}, 500);
					}
				}
			}, 50);
		}, 1000); // Delay for lane3

		let stop = Math.floor(Math.random() * 500) + 2000; // Random time to stop all lanes


		stopTimer = setTimeout(() => {
			stopSpin();
		}, stop); // Random time to stop lane3

	}

	function stopSpin() {
			lane1Done = true;
			lane2Done = true;
			lane3Done = true;

			isStopping = true;
			clearTimeout(stopTimer);
			//set the correct faces

			lane1Index = currentSlotFace.winIndex1 - 3;
			lane2Index = currentSlotFace.winIndex2 - 6;
			lane3Index = currentSlotFace.winIndex3 - 10;

	}

	//on spacebar press spinclearInterval
	window.addEventListener('keydown', (e) => {
		if (e.key === ' ') {
			e.preventDefault();
			if (!spinIsOnGoing){
				spin();
			} else if (lastStart && !isStopping) {
				isStopping = true;
				stopSpin();
			}
		}
	});

	let isStopping = $state(false);
</script>
<div class="flex h-full items-center justify-center">
    <div id="file1">
        <img
            class={borderColor1 ? `border-[${borderColor1}] border-8` : ''}
            src={`/symbols/Logos/${currentSlotFace.lane1[lane1Index + 2]}${currentSlotFace.lane1[lane1Index + 2] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane1[lane1Index + 2]}
        />
        <img
            class={borderColor2 ? `border-[${borderColor2}] border-8` : ''}
            src={`/symbols/Logos/${currentSlotFace.lane1[lane1Index + 1]}${currentSlotFace.lane1[lane1Index + 1] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane1[lane1Index + 1]}
        />
        <img
            class={borderColor3 ? `border-[${borderColor3}] border-8` : ''}
            src={`/symbols/Logos/${currentSlotFace.lane1[lane1Index]}${currentSlotFace.lane1[lane1Index] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane1[lane1Index]}
        />
    </div>
    <div id="file2">
        <img
            class={borderColor4 ? `border-[${borderColor4}] border-8` : ''}
            src={`symbols/Logos/${currentSlotFace.lane2[lane2Index + 2]}${currentSlotFace.lane2[lane2Index + 2] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane2[lane2Index + 2]}
        />
        <img
            class={borderColor5 ? `border-[${borderColor5}] border-8` : ''}
            src={`symbols/Logos/${currentSlotFace.lane2[lane2Index + 1]}${currentSlotFace.lane2[lane2Index + 1] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane2[lane2Index + 1]}
        />
        <img
            class={borderColor6 ? `border-[${borderColor6}] border-8` : ''}
            src={`symbols/Logos/${currentSlotFace.lane2[lane2Index]}${currentSlotFace.lane2[lane2Index] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane2[lane2Index]}
        />
    </div>
    <div id="file3">
        <img
            class={borderColor7 ? `border-[${borderColor7}] border-8` : ''}
            src={`symbols/Logos/${currentSlotFace.lane3[lane3Index + 2]}${currentSlotFace.lane3[lane3Index + 2] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane3[lane3Index + 2]}
        />
        <img
            class={borderColor8 ? `border-[${borderColor8}] border-8` : ''}
            src={`symbols/Logos/${currentSlotFace.lane3[lane3Index + 1]}${currentSlotFace.lane3[lane3Index + 1] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane3[lane3Index + 1]}
        />
        <img
            class={borderColor9 ? `border-[${borderColor9}] border-8` : ''}
            src={`symbols/Logos/${currentSlotFace.lane3[lane3Index]}${currentSlotFace.lane3[lane3Index] == 'linux' ? '.gif' : '.svg'}`}
            alt={currentSlotFace.lane3[lane3Index]}
        />
    </div>
</div>
<p>Money: ${money}</p>
<input bind:value={bet} min={1} max={money} type="number" class="text-black"/> <br>
<Button disabled={(!lastStart && spinIsOnGoing) || isStopping} on:click={() =>{
			if (!spinIsOnGoing){
				spin();
			} else {
			stopSpin();
			}
}}>
	{spinIsOnGoing ? 'STOP!!!' : 'Spin'}
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
