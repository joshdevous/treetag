<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Trophy,
		Award,
		Heart,
		Eye,
		ChevronLeft,
		ChevronRight,
		Crown
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	const entries = $derived(data.entries);

	function getInitials(name: string) {
		return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
	}

	function rankBadge(rank: number) {
		if (rank === 1) return { class: 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 ring-2 ring-amber-200', icon: Crown };
		if (rank === 2) return { class: 'bg-gradient-to-br from-stone-300 to-stone-400 text-stone-900 ring-2 ring-stone-200', icon: Trophy };
		if (rank === 3) return { class: 'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900 ring-2 ring-orange-200', icon: Trophy };
		return null;
	}

	function levelClasses(colour: string) {
		const map: Record<string, string> = {
			stone: 'bg-stone-100 text-stone-700',
			green: 'bg-green-100 text-green-700',
			emerald: 'bg-emerald-100 text-emerald-700',
			teal: 'bg-teal-100 text-teal-700',
			amber: 'bg-amber-100 text-amber-700'
		};
		return map[colour] ?? 'bg-stone-100 text-stone-700';
	}

	function goToPage(p: number) {
		goto(`/leaderboard?page=${p}`);
	}
</script>

<svelte:head>
	<title>Leaderboard — Treetag</title>
	<meta name="description" content="The top Tree Guardians of Charlton Kings — ranked by points earned through tags, observations, and adoptions." />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-12">
	<div class="mb-8 text-center">
		<div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-md shadow-amber-200/60">
			<Trophy size={22} class="text-amber-900" />
		</div>
		<h1 class="mt-4 text-3xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
			Leaderboard
		</h1>
		<p class="mt-2 text-[14px] text-stone-500">
			The top Tree Guardians of Charlton Kings, ranked by points.
		</p>
	</div>

	{#if entries.length > 0}
		<!-- Top 3 podium -->
		{#if data.page === 1 && entries.length >= 3}
			<div class="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
				{#each [entries[1], entries[0], entries[2]] as entry, i}
					{@const rank = entry.rank}
					{@const podiumHeights = ['pt-6', 'pt-2', 'pt-8']}
					{@const podiumBadge = rankBadge(rank)}
					<a
						href="/@{entry.username}"
						class="group flex flex-col items-center {podiumHeights[i]} {entry.isCurrentUser ? 'ring-2 ring-green-300 rounded-2xl' : ''}"
					>
						<div class="relative">
							<div class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-base font-bold text-white shadow-lg overflow-hidden sm:h-20 sm:w-20">
								{#if entry.avatar}
									<img src={entry.avatar} alt={entry.name} class="h-full w-full object-cover" />
								{:else}
									{getInitials(entry.name)}
								{/if}
							</div>
							{#if podiumBadge}
								<div class="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold {podiumBadge.class}">
									{rank}
								</div>
							{/if}
						</div>
						<p class="mt-3 line-clamp-1 max-w-full text-center text-[13px] font-semibold text-stone-800 group-hover:text-green-600">{entry.name}</p>
						<span class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium {levelClasses(entry.level.colour)}">
							{entry.level.title}
						</span>
						<p class="mt-1 text-[14px] font-bold text-amber-600">{entry.points.toLocaleString()} pts</p>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Full ranking list -->
		<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
			<ul class="divide-y divide-stone-100">
				{#each entries as entry}
					{@const rowBadge = rankBadge(entry.rank)}
					<li>
						<a
							href="/@{entry.username}"
							class="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-stone-50/70 sm:px-5 {entry.isCurrentUser ? 'bg-green-50/50' : ''}"
						>
							<!-- Rank -->
							<div class="flex w-10 shrink-0 items-center justify-center">
								{#if rowBadge}
									<div class="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold {rowBadge.class}">
										{entry.rank}
									</div>
								{:else}
									<span class="text-[13px] font-semibold text-stone-400">#{entry.rank}</span>
								{/if}
							</div>

							<!-- Avatar -->
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-[12px] font-bold text-white overflow-hidden">
								{#if entry.avatar}
									<img src={entry.avatar} alt={entry.name} class="h-full w-full object-cover" />
								{:else}
									{getInitials(entry.name)}
								{/if}
							</div>

							<!-- Identity -->
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<p class="truncate text-[14px] font-semibold text-stone-800">{entry.name}</p>
									{#if entry.isCurrentUser}
										<span class="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">You</span>
									{/if}
								</div>
								<div class="mt-0.5 flex items-center gap-2">
									<span class="min-w-0 truncate text-[11px] text-stone-400">@{entry.username}</span>
									<span class="inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium {levelClasses(entry.level.colour)}">
										{entry.level.title}
									</span>
								</div>
							</div>

							<!-- Stats -->
							<div class="hidden items-center gap-4 text-[12px] text-stone-500 sm:flex">
								<span class="inline-flex items-center gap-1" title="Adopted trees">
									<Heart size={12} class="text-rose-400" />
									{entry.adoptedTrees}
								</span>
								<span class="inline-flex items-center gap-1" title="Observations">
									<Eye size={12} class="text-blue-400" />
									{entry.observations}
								</span>
							</div>

							<!-- Points -->
							<div class="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5">
								<Award size={13} class="text-amber-600" />
								<span class="text-[13px] font-bold text-amber-700">{entry.points.toLocaleString()}</span>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		{#if data.totalPages > 1}
			<div class="mt-4 flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3">
				<p class="text-[12px] text-stone-500">
					Page {data.page} of {data.totalPages}
				</p>
				<div class="flex gap-2">
					<Button
						variant="outline"
						onclick={() => goToPage(data.page - 1)}
						disabled={data.page <= 1}
						class="h-auto gap-1 rounded-[10px] border-stone-200 px-3 py-1.5 text-[12px] font-medium text-stone-600"
					>
						<ChevronLeft size={14} />
						Previous
					</Button>
					<Button
						variant="outline"
						onclick={() => goToPage(data.page + 1)}
						disabled={data.page >= data.totalPages}
						class="h-auto gap-1 rounded-[10px] border-stone-200 px-3 py-1.5 text-[12px] font-medium text-stone-600"
					>
						Next
						<ChevronRight size={14} />
					</Button>
				</div>
			</div>
		{/if}
	{:else}
		<div class="rounded-2xl border border-stone-200 bg-white p-12 text-center">
			<Trophy size={32} class="mx-auto text-stone-300" />
			<p class="mt-3 text-[14px] text-stone-500">No guardians on the leaderboard yet. Tag your first tree to get on the board!</p>
			<Button href="/trees" class="mt-4 rounded-[10px] bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 text-[13px] font-semibold text-white">
				Browse Trees
			</Button>
		</div>
	{/if}
</div>
