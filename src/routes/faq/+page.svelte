<script lang="ts">
	import {
		ChevronRight,
		HelpCircle,
		Tag,
		Heart,
		Award,
		Leaf,
		BookOpen
	} from 'lucide-svelte';

	let { data } = $props();
	const categories = $derived(data.categories);

	const ICONS: Record<string, typeof HelpCircle> = {
		general: HelpCircle,
		tagging: Tag,
		adoption: Heart,
		points: Award,
		'tree-care': Leaf
	};

	function iconFor(slug: string) {
		return ICONS[slug] ?? BookOpen;
	}
</script>

<svelte:head>
	<title>FAQ — Treetag</title>
	<meta name="description" content="Frequently asked questions about Treetag — Charlton Kings's community tree-guardian project." />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-12">
	<div class="mb-10 text-center">
		<h1 class="text-3xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
			Frequently Asked Questions
		</h1>
		<p class="mt-2 text-[14px] text-stone-500">
			Everything you need to know about Treetag — from tagging your first tree to caring for an old favourite.
		</p>
	</div>

	{#if categories.length > 0}
		<!-- Category jump links -->
		<nav class="mb-8 flex flex-wrap justify-center gap-2">
			{#each categories as cat}
				{@const Icon = iconFor(cat.slug)}
				<a
					href="#{cat.slug}"
					class="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-600 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
				>
					<Icon size={12} />
					{cat.label}
				</a>
			{/each}
		</nav>

		<div class="space-y-10">
			{#each categories as cat}
				{@const Icon = iconFor(cat.slug)}
				<section id={cat.slug} class="scroll-mt-20">
					<div class="mb-4 flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
							<Icon size={15} />
						</div>
						<h2 class="text-lg font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
							{cat.label}
						</h2>
					</div>
					<div class="flex flex-col gap-2">
						{#each cat.entries as entry}
							<details class="group rounded-xl border border-stone-200 bg-white">
								<summary class="flex cursor-pointer select-none items-center justify-between p-4 text-[14px] font-semibold text-stone-900">
									{entry.question}
									<span class="shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-90">
										<ChevronRight size={16} />
									</span>
								</summary>
								<div class="px-4 pb-4 text-[13px] leading-relaxed text-stone-600">
									{entry.answer}
								</div>
							</details>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-stone-200 bg-white p-12 text-center">
			<HelpCircle size={32} class="mx-auto text-stone-300" />
			<p class="mt-3 text-[14px] text-stone-500">No FAQ entries yet. Run <code class="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[12px]">bun scripts/seed-faqs.ts</code> to populate them.</p>
		</div>
	{/if}

	<div class="mt-12 rounded-2xl border border-green-200 bg-green-50/40 p-6 text-center">
		<p class="text-[14px] text-stone-700">
			Still have questions? <a href="mailto:hello@treetag.org" class="font-semibold text-green-700 hover:text-green-800">Get in touch</a> — we'd love to hear from you.
		</p>
	</div>
</div>
