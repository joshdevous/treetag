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

	// Animated counter state
	let animatedStats = $state({
		trees: 0,
		observations: 0,
		points: 0
	});

	$effect(() => {
		const targets = {
			trees: data.adoptedTrees.length,
			observations: data.observationCount,
			points: data.profileUser.points
		};

		const duration = 1600;
		const start = performance.now();

		function ease(t: number) {
			return 1 - Math.pow(1 - t, 3); // easeOutCubic
		}

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = ease(progress);

			animatedStats.trees = Math.round(eased * targets.trees);
			animatedStats.observations = Math.round(eased * targets.observations);
			animatedStats.points = Math.round(eased * targets.points);

			if (progress < 1) {
				requestAnimationFrame(tick);
			}
		}

		requestAnimationFrame(tick);
	});

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
		{#if pUser.banner}
			<div class="h-48">
				<img src={pUser.banner} alt="Banner" class="h-full w-full object-cover" />
			</div>
		{:else}
			<div class="h-48 bg-gradient-to-br from-green-600/90 via-emerald-500/80 to-teal-400/70"></div>
		{/if}

		<div class="px-6 pb-6">
			<!-- Avatar (overlaps banner) -->
			<div class="-mt-16">
				{#if pUser.avatar}
					<img src={pUser.avatar} alt={pUser.name} class="h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover" />
				{:else}
					<div
						class="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-green-600 to-emerald-500 text-3xl font-bold text-white"
					>
						{getInitials(pUser.name)}
					</div>
				{/if}
			</div>

			<!-- Name + edit button row (below avatar, no overlap) -->
			<div class="mt-3 flex items-start justify-between">
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
		{#each [
			{ icon: TreePine, value: animatedStats.trees, label: 'Trees Adopted', color: 'green' },
			{ icon: Eye, value: animatedStats.observations, label: 'Observations', color: 'violet' },
			{ icon: Award, value: animatedStats.points, label: 'Points Earned', color: 'amber' }
		] as stat}
			{@const Icon = stat.icon}
			{@const colorMap = {
				green: { border: 'border-green-200/60', bg: 'bg-green-50/40', num: 'text-green-800', icon: 'text-green-600/70', label: 'text-green-700/60' },
				violet: { border: 'border-violet-200/60', bg: 'bg-violet-50/40', num: 'text-violet-800', icon: 'text-violet-600/70', label: 'text-violet-700/60' },
				amber: { border: 'border-amber-200/60', bg: 'bg-amber-50/40', num: 'text-amber-800', icon: 'text-amber-600/70', label: 'text-amber-700/60' }
			}}
			{@const colors = colorMap[stat.color as keyof typeof colorMap]}
			<div class="rounded-xl border {colors.border} {colors.bg} backdrop-blur-sm px-4 py-3.5 text-center">
				<div
					class="text-2xl font-bold {colors.num}"
					style="font-family: 'Space Mono', monospace;"
				>
					{stat.value}
				</div>
				<div class="mt-1.5 flex items-center justify-center gap-1.5 {colors.label}">
					<span class="shrink-0"><Icon size={14} strokeWidth={2} /></span>
					<span class="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
				</div>
			</div>
		{/each}
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
