<script lang="ts">
    import { onMount } from 'svelte';
  
    let coins: { left: number; delay: number; size: number }[] = [];
    const numberOfCoins = 250;

    function randomIntFromInterval(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  
    const generateCoins = () => {
      return Array.from({ length: numberOfCoins }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 5,
        size: randomIntFromInterval(20, 40),
      }));
    };
  
    onMount(() => {
      coins = generateCoins();
    });
  </script>
  
  <style>
    .coinsContainer {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 25;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      pointer-events: none;
      background-color: rgba(243, 243, 243, 0)
    }
  
    .coin {
      position: absolute;
      top: -10%;
      animation: drop 5s linear infinite;
    }
  
    @keyframes drop {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(110vh);
      }
    }
  </style>
  
  <div class="coinsContainer">
    {#each coins as coin (coin.left)}
      <div
        class="coin"
        style="
          left: {coin.left}%;
          animation-delay: {coin.delay}s;
          width: {coin.size}px;
          height: {coin.size}px;
          background: radial-gradient(circle, gold, darkgoldenrod);
          border-radius: 50%;
        "
      ></div>
    {/each}
  </div>
  