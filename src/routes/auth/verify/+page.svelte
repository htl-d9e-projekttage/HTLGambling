<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Heading, Textarea, Label, Input } from 'flowbite-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<main class="container mx-auto flex h-screen w-full justify-center">
	<Card class="w-full overflow-auto" size="md">
		<Heading tag="h1" class="mb-4 text-center">Verification</Heading>
		<p class="mb-4 text-center">
			Please answer the following question truthfully to verify your account. This is for your own
			safety.
		</p>
		{#if form?.message}
			<p class="text-red-500">{form.message}</p>
		{/if}
		<!-- <iframe src="/htlg-eignung.pdf" width="100%" height="500px" title="Eignungstest"></iframe> -->
		<form
			method="post"
			action="?/verify"
			use:enhance
			onsubmit={(e) => (loading = true)}
			class="flex flex-col gap-1"
		>
			<div>
				<Label for="a1">Würden Sie sich als spielsüchtig identifizieren?</Label>
				<Input name="a1" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a2"
					>Wie viele Stunden planen Sie, pro Tag zu spielen? Wie viele Stunden spielen Sie
					tatsächlich?</Label
				>
				<Input name="a2" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a3">Haben Sie schon einmal Geld verloren, das Sie nicht hatten?</Label>
				<Input name="a3" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a4"
					>Haben Sie schoneimal Dinge verkauft, um spielen zu können oder um Schulden zu begleichen?</Label
				>
				<Input name="a4" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a5">Haben Sie schon einmal gelogen, um spielen zu können?</Label>
				<Input name="a5" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a6">Haben Sie bereits gespielt, um negative Gefühle zu betäuben?</Label>
				<Input name="a6" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a7">Wann haben Sie das letzte Mal gespielt?</Label>
				<Input name="a7" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a8">Wie alt waren Sie, als Sie das erste Mal gespielt haben?</Label>
				<Input name="a8" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a9"
					>Haben Sie schon einmal versucht, mit dem Spielen aufzuhören und ist es Ihnen gelungen?</Label
				>
				<Input name="a9" required placeholder="Antwort..." />
			</div>
			<div>
				<Label for="a10"
					>Wie oft spielen Sie pro Woche? Wie viel Geld geben Sie pro Woche fürs Spielen aus?</Label
				>
				<Input name="a10" required placeholder="Antwort..." />
			</div>
			<Button type="submit" disabled={loading}>Validate</Button>
		</form>
	</Card>
</main>
