<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge, Button, Card, Heading } from 'flowbite-svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

</script>

<main class="container w-full mx-auto flex justify-center items-center h-screen">
	<Card class="w-full" size="md">
		{#if data.approved}
		<Badge class="mb-4" color="green">{data.explanation}</Badge>
		{/if}
		<Heading tag="h2" class="mb-4 text-center">Hi, {data.user.username}</Heading>
		<p class="mb-4 text-center">You are logged in!</p>
		<p class="mb-4 text-center">Your age is {data.user.age} and you have a balance of <mark>€ {data.user.money/100}</mark></p>
		<p class="mb-4 text-center">Streak: {data.user.streak} days</p>
		<form method="post" action="?/logout" use:enhance>
			<Button type="submit">Sign out</Button>
		</form>
		<form method="post" class="mt-2" action="?/delete" use:enhance>
			<Button type="submit">Delete Account</Button>
		</form>
	</Card>
</main>
