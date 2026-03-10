<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Search, TreePine, Filter, ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import TreeCard from '$lib/components/TreeCard.svelte';
	import TreeMap from '$lib/components/TreeMap.svelte';

	let { data } = $props();

	let searchValue = $state(data.filters.search);
	let speciesValue = $state(data.filters.species);
	let sortValue = $state(data.filters.sort);
	let view = $state<'grid' | 'map'>('grid');
	let searchTimeout: ReturnType<typeof setTimeout>;

	const mapTrees = $derived(
		data.trees
			.filter((t: any) => t.lat != null && t.lng != null)
			.map((t: any) => ({
				id: t.id,
				name: t.name,
				species: t.species,
				lat: t.lat,
				lng: t.lng,
				adopted: t.adopted,
				photoUrl: t.photoUrl
			}))
	);

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (speciesValue) params.set('species', speciesValue);
		if (sortValue && sortValue !== 'newest') params.set('sort', sortValue);
		const qs = params.toString();
		goto(`/trees${qs ? `?${qs}` : ''}`, { keepFocus: true });
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(applyFilters, 400);
	}

	function clearFilters() {
		searchValue = '';
		speciesValue = '';
		sortValue = 'newest';
		goto('/trees');
	}

	function goToPage(p: number) {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (speciesValue) params.set('species', speciesValue);
		if (sortValue !== 'newest') params.set('sort', sortValue);
		if (p > 1) params.set('page', p.toString());
		const qs = params.toString();
		goto(`/trees${qs ? `?${qs}` : ''}`);
	}

	const hasFilters = $derived(searchValue || speciesValue || sortValue !== 'newest');
</script>

<svelte:head>
	<title>Explore Trees — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
				Explore Trees
			</h1>
			<p class="mt-1 text-[14px] text-stone-400">
				{data.total} tree{data.total !== 1 ? 's' : ''} in the Charlton Kings database
			</p>
		</div>
		<div class="flex items-center gap-1 rounded-[10px] border border-stone-200 bg-white p-0.5">
			<button
				onclick={() => view = 'grid'}
				class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors {view === 'grid' ? 'bg-green-50 text-green-700' : 'text-stone-400 hover:text-stone-600'}"
			>
				<LayoutGrid size={14} />
				Grid
			</button>
			<button
				onclick={() => view = 'map'}
				class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors {view === 'map' ? 'bg-green-50 text-green-700' : 'text-stone-400 hover:text-stone-600'}"
			>
				<MapIcon size={14} />
				Map
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative flex-1 max-w-md">
			<Search size={15} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
			<input
				type="text"
				placeholder="Search trees by name, species, or location..."
				bind:value={searchValue}
				oninput={handleSearch}
				class="w-full rounded-[10px] border border-stone-200 bg-white py-2.5 pl-10 pr-3.5 text-[14px] text-stone-800 outline-none transition-colors placeholder:text-stone-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
			/>
		</div>

		<select
			bind:value={speciesValue}
			onchange={applyFilters}
			class="rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[13px] text-stone-600 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
		>
			<option value="">All species</option>
			{#each data.allSpecies as sp}
				<option value={sp}>{sp}</option>
			{/each}
		</select>

		<select
			bind:value={sortValue}
			onchange={applyFilters}
			class="rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[13px] text-stone-600 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
		>
			<option value="newest">Newest first</option>
			<option value="oldest">Oldest first</option>
			<option value="name">Name A–Z</option>
			<option value="species">Species A–Z</option>
		</select>

		{#if hasFilters}
			<button
				onclick={clearFilters}
				class="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
			>
				<X size={14} />
				Clear
			</button>
		{/if}
	</div>

	<!-- Tree View -->
	{#if view === 'map'}
		{#if mapTrees.length > 0}
			<TreeMap trees={mapTrees} height="550px" />
		{:else}
			<div class="flex flex-col items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/50 py-16">
				<MapIcon size={48} class="text-stone-200" />
				<p class="mt-3 text-[15px] font-medium text-stone-400">No trees with coordinates found</p>
			</div>
		{/if}
	{:else if data.trees.length > 0}
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.trees as tree}
				<TreeCard {...tree} status={tree.status} />
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-2">
				<button
					onclick={() => goToPage(data.page - 1)}
					disabled={data.page <= 1}
					class="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-[13px] font-medium text-stone-600 transition-colors hover:border-green-400 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<ChevronLeft size={14} />
					Previous
				</button>

				<span class="px-3 text-[13px] text-stone-400">
					Page {data.page} of {data.totalPages}
				</span>

				<button
					onclick={() => goToPage(data.page + 1)}
					disabled={data.page >= data.totalPages}
					class="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-[13px] font-medium text-stone-600 transition-colors hover:border-green-400 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Next
					<ChevronRight size={14} />
				</button>
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/50 py-16">
			<TreePine size={48} class="text-stone-200" />
			<p class="mt-3 text-[15px] font-medium text-stone-400">No trees found</p>
			{#if hasFilters}
				<p class="mt-1 text-[13px] text-stone-400">Try adjusting your search or filters.</p>
				<button
					onclick={clearFilters}
					class="mt-4 rounded-[10px] border border-stone-200 px-4 py-2 text-[13px] font-medium text-stone-600 transition-colors hover:border-green-400 hover:bg-green-50"
				>
					Clear Filters
				</button>
			{:else}
				<p class="mt-1 text-[13px] text-stone-400">No trees have been registered yet.</p>
			{/if}
		</div>
	{/if}
</div>
