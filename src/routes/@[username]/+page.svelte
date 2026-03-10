<script lang="ts">
	import { page } from '$app/stores';
	import { getLevelProgress, type LevelConfig } from '$lib/levels';
	import {
		TreePine,
		Eye,
		Heart,
		Shield,
		Award,
		Calendar,
		Leaf,
		Camera,
		Bug,
		AlertTriangle,
		FileText,
		Tag,
		Sprout,
		Trees,
		Settings,
		Sparkles
	} from 'lucide-svelte';

	let { data } = $props();

	const levels = $derived(($page.data as any).levels as LevelConfig[]);
	const pUser = $derived(data.profileUser);

	const colourMap: Record<string, { bg: string; text: string; bar: string; ring: string }> = {
		stone: { bg: 'bg-stone-100', text: 'text-stone-600', bar: 'bg-stone-400', ring: 'ring-stone-200' },
		green: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500', ring: 'ring-green-200' },
		emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', ring: 'ring-emerald-200' },
		teal: { bg: 'bg-teal-50', text: 'text-teal-700', bar: 'bg-teal-500', ring: 'ring-teal-200' },
		amber: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', ring: 'ring-amber-200' }
	};

	const iconMap: Record<string, any> = { Sprout, Leaf, TreePine, Trees, Award };

	const levelInfo = $derived(getLevelProgress(pUser.points, levels));
	const lc = $derived(colourMap[levelInfo.current.colour] ?? colourMap.stone);
	const LevelIcon = $derived(iconMap[levelInfo.current.icon] ?? Sprout);

	function getInitials(name: string) {
		return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
	}

	const observationIcons: Record<string, any> = {
		tag: Tag,
		health_check: Heart,
		wildlife: Bug,
		disease: AlertTriangle,
		photo: Camera,
		note: FileText
	};

	function formatDate(iso: string | null) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function timeAgo(iso: string | null) {
		if (!iso) return '';
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'Just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		if (days < 30) return `${days}d ago`;
		return formatDate(iso);
	}
</script>

<svelte:head>
	<title>{pUser.name} (@{pUser.username}) — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-10">
	<!-- Header card -->
	<div class="relative overflow-hidden rounded-2xl border border-stone-200 bg-white">
		<!-- Top gradient banner -->
		<div class="h-24 bg-gradient-to-br from-green-600/90 via-emerald-500/80 to-teal-400/70"></div>

		<div class="px-6 pb-6">
			<!-- Avatar + info row -->
			<div class="flex items-end gap-4 -mt-10">
				<div
					class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-green-600 to-emerald-500 text-2xl font-bold text-white shadow-md"
				>
					{getInitials(pUser.name)}
				</div>
				<div class="flex flex-1 items-start justify-between pb-1">
					<div>
						<h1 class="text-xl font-bold text-stone-900">{pUser.name}</h1>
						<p class="text-[13px] text-stone-400">@{pUser.username}</p>
					</div>
					{#if data.isOwnProfile}
						<a
							href="/settings"
							class="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-[12px] font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
						>
							<Settings size={13} /> Edit Profile
						</a>
					{/if}
				</div>
			</div>

			<!-- Badges row -->
			<div class="mt-4 flex flex-wrap items-center gap-2.5">
				{#if pUser.role === 'admin'}
					<span class="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[12px] font-medium text-rose-500">
						<Shield size={12} /> Admin
					</span>
				{/if}
				<span class="inline-flex items-center gap-1.5 rounded-full {lc.bg} px-2.5 py-1 text-[12px] font-medium {lc.text}">
					<LevelIcon size={12} /> {levelInfo.current.title}
				</span>
				<span class="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-2.5 py-1 text-[12px] text-stone-500">
					<Calendar size={12} />
					Joined {formatDate(pUser.createdAt)}
				</span>
			</div>

			<!-- Level progress -->
			{#if levelInfo.next}
				<div class="mt-4">
					<div class="flex items-center justify-between text-[11px]">
						<span class="{lc.text} font-medium">{levelInfo.current.title}</span>
						<span class="text-stone-400">{levelInfo.next.title} — {levelInfo.next.minPoints - pUser.points} pts to go</span>
					</div>
					<div class="mt-1.5 h-2 w-full rounded-full bg-stone-100">
						<div
							class="h-full rounded-full {lc.bar} transition-all duration-500"
							style="width: {Math.round(levelInfo.progress * 100)}%"
						></div>
					</div>
				</div>
			{:else}
				<div class="mt-4 flex items-center gap-1.5 text-[12px] text-amber-600">
					<Sparkles size={13} /> Max level reached!
				</div>
			{/if}
		</div>
	</div>

	<!-- Stats row -->
	<div class="mt-6 grid grid-cols-3 gap-3">
		<div class="rounded-xl border border-green-100 bg-green-50/50 p-4 text-center">
			<div class="flex items-center justify-center gap-2">
				<TreePine size={17} class="text-green-600" />
				<span class="text-2xl font-bold text-green-700">{data.adoptedTrees.length}</span>
			</div>
			<p class="mt-1 text-[11px] font-medium uppercase tracking-wider text-green-600/60">Trees Adopted</p>
		</div>
		<div class="rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-center">
			<div class="flex items-center justify-center gap-2">
				<Eye size={17} class="text-violet-600" />
				<span class="text-2xl font-bold text-violet-700">{data.observationCount}</span>
			</div>
			<p class="mt-1 text-[11px] font-medium uppercase tracking-wider text-violet-600/60">Observations</p>
		</div>
		<div class="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-center">
			<div class="flex items-center justify-center gap-2">
				<Award size={17} class="text-amber-600" />
				<span class="text-2xl font-bold text-amber-700">{pUser.points}</span>
			</div>
			<p class="mt-1 text-[11px] font-medium uppercase tracking-wider text-amber-600/60">Points Earned</p>
		</div>
	</div>

	<!-- Adopted Trees -->
	<section class="mt-8">
		<h2 class="mb-3 text-[15px] font-semibold text-stone-800">
			{data.isOwnProfile ? 'Your Adopted Trees' : 'Adopted Trees'}
		</h2>
		{#if data.adoptedTrees.length === 0}
			<div class="rounded-xl border border-dashed border-stone-200 bg-stone-50/40 px-6 py-8 text-center">
				<Leaf size={24} class="mx-auto mb-2 text-stone-300" />
				<p class="text-[13px] text-stone-400">
					{data.isOwnProfile ? "You haven't adopted any trees yet." : 'No adopted trees yet.'}
				</p>
				{#if data.isOwnProfile}
					<a href="/trees" class="mt-2 inline-block text-[13px] font-medium text-green-600 hover:underline">
						Explore trees →
					</a>
				{/if}
			</div>
		{:else}
			<div class="grid gap-2.5 sm:grid-cols-2">
				{#each data.adoptedTrees as tree}
					<a
						href="/trees/{tree.id}"
						class="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 transition-all hover:border-green-200 hover:shadow-sm"
					>
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
							<TreePine size={16} />
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-[13px] font-medium text-stone-800">{tree.name}</p>
							<p class="text-[11px] text-stone-400">{tree.species}</p>
						</div>
						{#if tree.adoptedAt}
							<span class="shrink-0 text-[10px] text-stone-300">{formatDate(tree.adoptedAt)}</span>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Recent Activity -->
	<section class="mt-8">
		<h2 class="mb-3 text-[15px] font-semibold text-stone-800">Recent Activity</h2>
		{#if data.recentObservations.length === 0}
			<div class="rounded-xl border border-dashed border-stone-200 bg-stone-50/40 px-6 py-8 text-center">
				<Eye size={24} class="mx-auto mb-2 text-stone-300" />
				<p class="text-[13px] text-stone-400">
					{data.isOwnProfile ? 'No observations yet. Start by visiting a tree!' : 'No activity yet.'}
				</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each data.recentObservations as obs}
					{@const Icon = observationIcons[obs.type] ?? Eye}
					<div class="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-50 text-stone-400">
							<Icon size={14} />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-[13px] text-stone-700">
								<span class="font-medium capitalize">{obs.type.replace('_', ' ')}</span>
								on <span class="font-medium">{obs.treeName}</span>
							</p>
							{#if obs.content}
								<p class="mt-0.5 truncate text-[12px] text-stone-400">{obs.content}</p>
							{/if}
						</div>
						<span class="shrink-0 text-[10px] text-stone-300">{timeAgo(obs.createdAt)}</span>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
