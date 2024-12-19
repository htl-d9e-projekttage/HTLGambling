<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
</script>

<Navbar
	class="relative z-50 flex w-full flex-col items-center justify-between border-b-4 border-b-cyan-600 dark:border-b-orange-400 md:flex-row"
>
	<div class="flex flex-1 items-center justify-start">
		<NavUl ulClass="border-none">
			<NavLi href="/">Home</NavLi>
			<NavLi href="/slots">Slots</NavLi>
			<NavLi href="/blackjack">Blackjack</NavLi>
			<NavLi href="/aboutus">About Us</NavLi>
			<NavLi href="/auth">User</NavLi>
		</NavUl>
	</div>

	<div class="absolute left-1/2 -translate-x-1/2 transform">
		<NavBrand href="/">
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>HTL - Gambling</span
			>
		</NavBrand>
	</div>

	<div class="flex flex-1 items-center justify-end">
		<DarkMode />
		<NavHamburger />
	</div>
</Navbar>

<div class="m-4">
	{@render children()}
</div>
