<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
</script>
  
<Navbar class="border-b-cyan-600 border-b-4 dark:border-b-orange-400 flex flex-col md:flex-row justify-between w-full items-center relative z-50">

    <div class="flex-1 flex items-center justify-start">
		<NavUl>
			<NavLi href="/">Home</NavLi>
			<NavLi href="/slots">Slots</NavLi>
      <NavLi href="/blackjack">Blackjack</NavLi>
			<NavLi href="/aboutus">About Us</NavLi>
			<NavLi href="/auth">User</NavLi>
		</NavUl>
    </div>

	<div class="absolute left-1/2 transform -translate-x-1/2">
		<NavBrand href="/">
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">HTL - Gambling</span>
		</NavBrand>
	</div>

    <div class="flex-1 flex items-center justify-end">
		<DarkMode />
		<NavHamburger />
    </div>
</Navbar>

<div class="m-4">
	{@render children()}
</div>
