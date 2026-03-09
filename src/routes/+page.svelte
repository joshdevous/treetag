<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Treetag — Charlton Kings Tree Guardian</title>
</svelte:head>

<div class="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 text-center">
	<h1 class="text-4xl font-bold">Welcome to Treetag 🌳</h1>
	<p class="max-w-md text-muted-foreground">
		Discover, tag, and care for the trees of Charlton Kings. Every tree has a story — help us tell
		it.
	</p>
	<div class="flex gap-3">
		<a
			href="/trees"
			class="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90"
		>
			Explore the Map
		</a>
		{#if !data.user}
			<a
				href="/auth/register"
				class="rounded-md border border-border px-5 py-2.5 font-medium hover:bg-accent"
			>
				Join as a Guardian
			</a>
		{/if}
	</div>
</div>

