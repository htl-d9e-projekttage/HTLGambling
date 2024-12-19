<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Heading, Input, Label } from 'flowbite-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="container mx-auto flex h-screen w-full items-center justify-center">
	<Card class="w-full" size="md">
		<Heading tag="h1" class="mb-4 text-center">Register</Heading>
		<form method="post" action="?/register" use:enhance>
			<div class="mb-4">
				<Label for="username">Username</Label>
				<Input name="username" required placeholder="Username" />
			</div>
			<div class="mb-4">
				<Label for="password">Password</Label>
				<Input type="password" name="password" required placeholder="Password" />
			</div>
			<div class="mb-4">
				<Label for="age">Alter</Label>
				<Input type="number" name="age" required placeholder="Alter" />
			</div>
			<div class="mb-4">
				<a href="./login" class="underline">Login</a>
			</div>
			<Button type="submit">Register</Button>
		</form>
		<p class="text-red-500">{form?.message ?? ''}</p>
	</Card>
</main>
