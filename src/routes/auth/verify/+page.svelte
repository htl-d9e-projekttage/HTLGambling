<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Heading, Textarea, Label } from 'flowbite-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
    let loading = $state(false);
</script>

<main class="container w-full mx-auto flex justify-center items-center h-screen">
	<Card class="w-full" size="md">
		<Heading tag="h1" class="mb-4 text-center">Verification</Heading>
		<p class="mb-4 text-center">Please answer the following question truthfully to verify your account. This is for your own safety.</p>
        {#if form?.message}
            <p class="text-red-500">{form.message}</p>
        {/if}
        <iframe src="/htlg-eignung.pdf" width="100%" height="500px" title="Eignungstest"></iframe>
        <form method="post" action="?/verify" use:enhance onsubmit={(e) => loading = true}>
			<div>
				<Label for="answers">Answers</Label>
				<Textarea name="answers" required placeholder="Answers" />
			</div>
			<Button type="submit" disabled={loading}>Validate</Button>
		</form>
	</Card>
</main>
