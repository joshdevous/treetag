<script lang="ts">
	import { TreePine, MapPin, Heart, Tag } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		id: string;
		name: string;
		species: string;
		age: number | null;
		location: string;
		tags: string[];
		adopted: boolean;
		photoUrl?: string | null;
		status?: string;
	}

	let { id, name, species, age, location, tags, adopted, photoUrl, status }: Props = $props();
</script>

<a
	href="/trees/{id}"
	class="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:border-green-200 hover:shadow-md"
>
	<!-- Photo -->
	<div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
		{#if photoUrl}
			<img src={photoUrl} alt={name} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<TreePine size={40} class="text-green-200" />
			</div>
		{/if}
		{#if adopted}
			<div class="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-green-600 shadow-sm backdrop-blur-sm">
				<Heart size={11} class="fill-green-600" />
				Adopted
			</div>
		{/if}
		{#if status === 'pending'}
			<div class="absolute left-2.5 top-2.5 rounded-full bg-amber-500/90 px-2 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
				Pending
			</div>
		{:else if status === 'rejected'}
			<div class="absolute left-2.5 top-2.5 rounded-full bg-red-500/90 px-2 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
				Rejected
			</div>
		{/if}
	</div>

	<!-- Info -->
	<div class="p-4">
		<h3 class="text-[15px] font-bold text-stone-800 transition-colors group-hover:text-green-600" style="font-family: 'Playfair Display', serif;">
			{name}
		</h3>
		<p class="mt-0.5 text-[13px] text-stone-500">{species}</p>

		<div class="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-stone-400">
			{#if location}
				<span class="flex items-center gap-1">
					<MapPin size={11} />
					{location}
				</span>
			{/if}
			{#if age}
				<span>~{age} yrs</span>
			{/if}
		</div>

		{#if tags.length > 0}
			<div class="mt-3 flex flex-wrap gap-1">
				{#each tags.slice(0, 3) as tag}
					<Badge variant="secondary" class="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
						{tag}
					</Badge>
				{/each}
				{#if tags.length > 3}
					<Badge variant="secondary" class="rounded-full bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-500">
						+{tags.length - 3}
					</Badge>
				{/if}
			</div>
		{/if}
	</div>
</a>
