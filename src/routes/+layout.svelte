<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { AccordionItem, Accordion, Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode  } from 'flowbite-svelte';
</script>
  

<Navbar class="border-b border-b-orange-400 border-b-4 dark:border-b-orange-400 fixed">
    <NavBrand href="/">
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">HTL - Gambling</span>
    </NavBrand>
    <NavHamburger  />
    <NavUl>
        <NavLi href="/">Home</NavLi>
        <NavLi href="/slots">Slots</NavLi>
        <NavLi href="/aboutus">About Us</NavLi>
    </NavUl>
    <DarkMode/>
</Navbar>

<div class="pt-24 m-4">
	{@render children()}
</div>

