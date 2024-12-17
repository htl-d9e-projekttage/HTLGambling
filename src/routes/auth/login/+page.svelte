<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Heading, Input, Label } from 'flowbite-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="container w-full mx-auto flex justify-center items-center h-screen">
	<Card class="w-full" size="md">
		<Heading tag="h1" class="mb-4 text-center">Login</Heading>
		<form method="post" action="?/login" use:enhance>
			<div>
				<Label for="username">Username</Label>
				<Input name="username" required placeholder="Username" />
			</div>
			<div class="mb-4">
				<Label for="password">Password</Label>
				<Input type="password" name="password" required placeholder="Password" />
			</div>
			<div class="mb-4">
				<a href="./register" class="underline">Register</a>
			</div>
			<Button type="submit">Login</Button>
		</form>
		<p class="text-red-500">{form?.message ?? ''}</p>
	</Card>
</main>
