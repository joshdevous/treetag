<script lang="ts">
	import {
		Trees,
		TreePine,
		TreeDeciduous,
		Sprout,
		Shield,
		Users,
		Eye,
		Heart,
		Map as MapIcon,
		ScanLine,
		ChevronRight,
		Smartphone,
		Tag,
		Bird,
		Camera,
		Activity,
		AlertTriangle,
		Leaf
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	// Animated counter state
	let animatedStats = $state({
		trees: 0,
		guardians: 0,
		observations: 0,
		adopted: 0
	});

	$effect(() => {
		const targets = {
			trees: data.stats.trees,
			guardians: data.stats.guardians,
			observations: data.stats.observations,
			adopted: data.stats.adopted
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
			animatedStats.guardians = Math.round(eased * targets.guardians);
			animatedStats.observations = Math.round(eased * targets.observations);
			animatedStats.adopted = Math.round(eased * targets.adopted);

			if (progress < 1) {
				requestAnimationFrame(tick);
			}
		}

		requestAnimationFrame(tick);
	});

	const gradients = [
		'linear-gradient(135deg, #bbf7d0 0%, #dcfce7 50%, #f0fdf4 100%)',
		'linear-gradient(135deg, #a7f3d0 0%, #d1fae5 50%, #ecfdf5 100%)',
		'linear-gradient(135deg, #c4b5fd 0%, #ede9fe 50%, #f5f3ff 100%)',
		'linear-gradient(135deg, #fde68a 0%, #fef9c3 50%, #fefce8 100%)',
		'linear-gradient(135deg, #99f6e4 0%, #ccfbf1 50%, #f0fdfa 100%)',
		'linear-gradient(135deg, #fed7aa 0%, #ffedd5 50%, #fff7ed 100%)'
	];

	const tagColors: Record<string, { bg: string; text: string; border: string }> = {
		healthy: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
		heritage: { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' },
		wildlife: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
		ancient: { bg: '#fef9c3', text: '#a16207', border: '#fef08a' },
		diseased: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' }
	};

	const activityMeta: Record<string, { color: string; verb: string }> = {
		tag: { color: '#16a34a', verb: 'tagged' },
		wildlife: { color: '#2563eb', verb: 'spotted wildlife in' },
		photo: { color: '#db2777', verb: 'photographed' },
		health_check: { color: '#7c3aed', verb: 'health check on' },
		disease: { color: '#ea580c', verb: 'reported disease on' },
		note: { color: '#6b7280', verb: 'noted on' }
	};

	function timeAgo(iso: string): string {
		const ms = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(ms / 60_000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}

	function initials(name: string): string {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	const faqs = [
		{
			q: 'What is Treetag?',
			a: 'Treetag is a community project for discovering, tagging, and caring for the trees of Charlton Kings. Each tree gets a QR code tag, making it easy to learn about and track the health of our local canopy.'
		},
		{
			q: 'How do I scan a QR code?',
			a: "Look for QR code tags on trees around Charlton Kings. Simply scan with your phone's camera or a QR reader app to instantly view the tree's profile, history, and observations."
		},
		{
			q: 'How do I adopt a tree?',
			a: "Create an account, explore the map or browse trees to find one you'd like to care for, and click the Adopt button on its page. Adopting a tree makes you its guardian and earns you 50 points straight away."
		},
		{
			q: 'What kinds of observations can I make?',
			a: 'You can tag a tree, upload photos, report wildlife sightings, submit health checks, flag signs of disease, or leave general notes. Each type contributes differently to the community record and earns you points.'
		},
		{
			q: 'How does the points system work?',
			a: 'Every interaction earns points — tagging a tree (5 pts), uploading a photo (10 pts), reporting wildlife (15 pts), health checks (20 pts), flagging disease (25 pts), leaving notes (5 pts), and adopting a tree (50 pts). You also get a daily bonus of 5 pts and a 30 pt reward for a 7-day streak.'
		},
		{
			q: 'What are the guardian levels?',
			a: 'As you earn points you progress through five levels: Seedling (0 pts), Sapling (50 pts), Trunk (200 pts), Canopy (500 pts), and Ancient Oak (1,000 pts). Each level unlocks a new badge on your profile.'
		},
		{
			q: 'Can I register a new tree?',
			a: 'Admins can register new trees through the app. If you know of a noteworthy tree that isn\'t tracked yet, get in touch and our team will add it to the map with a QR tag.'
		},
		{
			q: 'Is Treetag free to use?',
			a: 'Yes — Treetag is completely free. It\'s a community-driven project built to help residents engage with and protect the local tree canopy in Charlton Kings.'
		}
	];
</script>

<svelte:head>
	<title>Treetag — Charlton Kings Tree Guardian</title>
</svelte:head>

<!-- ============================================================ -->
<!-- HERO                                                          -->
<!-- ============================================================ -->
<section
	class="relative -mt-14 flex min-h-[calc(70vh+56px)] flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20"
	style="background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #d1fae5 85%, #ffffff 100%);"
>
	<!-- Floating nature icons -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="hero-float-icon" style="top: 5%; left: 6%; animation-delay: 0s;">
			<TreeDeciduous size={52} strokeWidth={0.8} />
		</div>
		<div class="hero-float-icon" style="top: 10%; right: 10%; animation-delay: 1s; transform: rotate(20deg);">
			<Leaf size={34} strokeWidth={1} />
		</div>
		<div class="hero-float-icon" style="top: 25%; left: 4%; animation-delay: 0.5s;">
			<Bird size={28} strokeWidth={1} />
		</div>
		<div class="hero-float-icon" style="bottom: 18%; right: 5%; animation-delay: 2s;">
			<Trees size={56} strokeWidth={0.7} />
		</div>
		<div class="hero-float-icon" style="bottom: 35%; left: 10%; animation-delay: 1.5s;">
			<Sprout size={26} strokeWidth={1.2} />
		</div>
		<div class="hero-float-icon" style="top: 45%; right: 8%; animation-delay: 3s;">
			<Heart size={24} strokeWidth={1.2} />
		</div>
		<div class="hero-float-icon" style="bottom: 10%; left: 25%; animation-delay: 0.8s;">
			<TreePine size={40} strokeWidth={0.9} />
		</div>
		<div class="hero-float-icon" style="top: 18%; left: 30%; animation-delay: 2.5s;">
			<Tag size={22} strokeWidth={1.2} />
		</div>
		<div class="hero-float-icon" style="top: 3%; left: 50%; animation-delay: 3.5s;">
			<Leaf size={20} strokeWidth={1} />
		</div>
		<div class="hero-float-icon" style="top: 35%; left: 2%; animation-delay: 1.2s; transform: rotate(-15deg);">
			<TreePine size={44} strokeWidth={0.8} />
		</div>
		<div class="hero-float-icon" style="bottom: 14%; right: 22%; animation-delay: 0.3s;">
			<Bird size={22} strokeWidth={1.2} />
		</div>
		<div class="hero-float-icon" style="top: 60%; left: 18%; animation-delay: 4s;">
			<Shield size={20} strokeWidth={1.2} />
		</div>
		<div class="hero-float-icon" style="bottom: 28%; right: 28%; animation-delay: 2.8s; transform: rotate(10deg);">
			<Sprout size={30} strokeWidth={1} />
		</div>
		<div class="hero-float-icon" style="top: 8%; left: 65%; animation-delay: 1.8s;">
			<Trees size={34} strokeWidth={0.9} />
		</div>
		<div class="hero-float-icon" style="bottom: 6%; right: 42%; animation-delay: 3.2s;">
			<Heart size={18} strokeWidth={1.3} />
		</div>
		<div class="hero-float-icon" style="top: 50%; right: 3%; animation-delay: 0.7s; transform: rotate(-20deg);">
			<TreeDeciduous size={38} strokeWidth={0.9} />
		</div>
		<div class="hero-float-icon" style="top: 70%; left: 4%; animation-delay: 2.2s;">
			<Tag size={18} strokeWidth={1.3} />
		</div>
		<div class="hero-float-icon" style="bottom: 45%; right: 38%; animation-delay: 4.5s;">
			<Leaf size={26} strokeWidth={1} />
		</div>
	</div>

	<div
		class="relative max-w-xl text-center"
		style="animation: fade-slide-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both"
	>
		<h1
			class="mb-5 text-5xl leading-tight text-green-950"
			style="font-family: 'Playfair Display', Georgia, serif; font-weight: 700; letter-spacing: -1.5px;"
		>
			Every tree has<br />
			<span class="text-green-700">a story</span>
		</h1>

		<p class="mx-auto mb-9 max-w-md text-base leading-relaxed text-green-950/70">
			Discover, tag, and care for the trees of Charlton Kings. Scan a QR code, adopt a tree, and
			join a community of guardians protecting our local canopy.
		</p>

		<div class="mb-12 flex flex-wrap justify-center gap-3">
			<Button
				href="/trees"
				class="rounded-xl bg-green-700 px-7 py-3 text-sm font-semibold shadow-lg shadow-green-900/20 hover:bg-green-800 hover:shadow-xl h-auto"
			>
				<MapIcon size={16} /> Explore the Map
			</Button>
			<Button
				href="/scan"
				variant="outline"
				class="rounded-xl border-white/50 bg-white/70 backdrop-blur-md px-7 py-3 text-sm font-semibold text-green-900 shadow-sm hover:bg-white/90 h-auto"
			>
				<ScanLine size={16} /> Scan a QR Code
			</Button>
		</div>

		<div class="grid grid-cols-2 gap-3 mx-auto w-full max-w-sm sm:max-w-lg sm:grid-cols-4">
			{#each [
				{ icon: TreePine, value: animatedStats.trees, label: 'Trees' },
				{ icon: Users, value: animatedStats.guardians, label: 'Guardians' },
				{ icon: Eye, value: animatedStats.observations, label: 'Observations' },
				{ icon: Heart, value: animatedStats.adopted, label: 'Adopted' }
			] as stat}
				{@const Icon = stat.icon}
				<div class="rounded-xl border border-white/50 bg-white/70 backdrop-blur-md px-4 py-3.5 text-center shadow-sm">
					<div
						class="text-2xl font-bold text-green-950"
						style="font-family: 'Space Mono', monospace;"
					>
						{stat.value}
					</div>
					<div class="mt-1.5 flex items-center justify-center gap-1.5 text-green-900/70">
						<span class="shrink-0"><Icon size={14} strokeWidth={2} /></span>
						<span class="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ============================================================ -->
<!-- RECENTLY ACTIVE TREES                                         -->
<!-- ============================================================ -->
<section
	class="px-6 pb-8"
	style="animation: fade-slide-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both"
>
	<div class="mx-auto max-w-7xl">
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold tracking-tight text-stone-900">Recently Active Trees</h2>
				<p class="text-xs text-stone-400">Trees with recent observations from the community</p>
			</div>
			<Button
				href="/trees"
				variant="outline"
				class="rounded-lg border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-green-600 hover:border-green-600 h-auto"
			>
				View All <ChevronRight size={13} />
			</Button>
		</div>

		{#if data.recentTrees.length > 0}
			<div class="flex gap-3 overflow-x-auto pb-2" style="scroll-snap-type: x mandatory;">
				{#each data.recentTrees as tree, i}
					<div
						class="min-w-[220px] max-w-[220px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
						style="scroll-snap-align: start; animation: fade-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) {0.6 + i * 0.08}s both;"
					>
						<div
							class="relative flex h-24 items-center justify-center overflow-hidden"
							style="background: {gradients[i % gradients.length]};"
						>
							<div class="text-green-600 opacity-50">
								<Leaf size={40} strokeWidth={1.2} />
							</div>
							{#if !tree.adopted}
								<div
									class="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-green-200 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-600 backdrop-blur-sm"
								>
									<Heart size={9} /> Adopt me
								</div>
							{/if}
						</div>
						<div class="p-3">
							<div class="text-[13px] font-bold leading-snug text-stone-900">{tree.name}</div>
							<div class="mb-2 text-[11px] text-stone-600">
								{tree.species}{#if tree.age}&nbsp;·&nbsp;~{tree.age}yr{/if}
							</div>
							<div class="flex flex-wrap gap-1">
								{#each tree.tags.slice(0, 2) as tag}
									{@const s = tagColors[tag] ?? tagColors.healthy}
									<span
										class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
										style="background: {s.bg}; color: {s.text}; border: 1px solid {s.border};"
									>
										{tag}
									</span>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-400"
			>
				No trees registered yet. Be the first to register a tree!
			</div>
		{/if}
	</div>
</section>

<!-- ============================================================ -->
<!-- COMMUNITY FEED                                                -->
<!-- ============================================================ -->
<section
	class="px-6 pb-10"
	style="animation: fade-slide-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both"
>
	<div class="mx-auto max-w-7xl">
		<div class="mb-4 flex items-center gap-2">
			<h2 class="text-xl font-bold tracking-tight text-stone-900">Community Feed</h2>
			<span
				class="h-1.5 w-1.5 rounded-full bg-green-600"
				style="box-shadow: 0 0 6px rgba(22,163,74,0.4); animation: pulse-dot 2s infinite;"
			></span>
		</div>

		{#if data.activity.length > 0}
			<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.activity as item, i}
					{@const meta = activityMeta[item.type] ?? { color: '#6b7280', verb: 'interacted with' }}
					<div
						class="flex items-start gap-3 rounded-xl border border-stone-100 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
						style="animation: fade-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) {0.8 + i * 0.06}s both;"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
							style="background: {meta.color}18; border: 1.5px solid {meta.color}30; color: {meta.color}; font-family: 'Space Mono', monospace;"
						>
							{initials(item.userName)}
						</div>
						<div class="min-w-0 flex-1">
							<div class="text-[13px] leading-snug">
								<span class="font-semibold" style="color: {meta.color};">{item.userName}</span>
								{' '}<span class="text-stone-600">{meta.verb}</span>
								{' '}<span class="font-semibold text-stone-900">{item.treeName}</span>
							</div>
							<div class="mt-0.5 text-[11px] text-stone-400">{timeAgo(item.createdAt)}</div>
						</div>
						<div class="mt-0.5 shrink-0 opacity-40" style="color: {meta.color};">
							{#if item.type === 'tag'}
								<Tag size={14} />
							{:else if item.type === 'wildlife'}
								<Bird size={14} />
							{:else if item.type === 'photo'}
								<Camera size={14} />
							{:else if item.type === 'health_check'}
								<Activity size={14} />
							{:else if item.type === 'disease'}
								<AlertTriangle size={14} />
							{:else}
								<Leaf size={14} />
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-400"
			>
				No community activity yet. Start by tagging a tree!
			</div>
		{/if}
	</div>
</section>

<!-- ============================================================ -->
<!-- HOW TREETAG WORKS                                             -->
<!-- ============================================================ -->
<section
	class="border-t border-stone-100 px-6 py-12"
	style="background: linear-gradient(180deg, #fafaf9 0%, rgba(220,252,231,0.25) 50%, #fafaf9 100%);"
>
	<div class="mx-auto max-w-3xl text-center">
		<h2 class="mb-2 text-xl font-bold tracking-tight text-stone-900">How Treetag Works</h2>
		<p class="mb-8 text-[13px] text-stone-400">Three steps to becoming a Tree Guardian</p>

		<div class="flex flex-wrap items-stretch justify-center gap-0">
			{#each [
				{
					step: '1',
					title: 'Find & Scan',
					desc: 'Spot a tree with a QR code and scan it, or browse the map to discover trees near you.',
					icon: Smartphone,
					delay: 0
				},
				{
					step: '2',
					title: 'Tag & Observe',
					desc: 'Record your visit, upload photos, report wildlife sightings, or flag any health concerns.',
					icon: Tag,
					delay: 0.5
				},
				{
					step: '3',
					title: 'Adopt & Earn',
					desc: 'Adopt a tree to become its guardian. Earn loyalty points for regular check-ins and care.',
					icon: Heart,
					delay: 1
				}
			] as card, i}
				{@const CardIcon = card.icon}
				{#if i > 0}
					<div class="hidden sm:flex items-center px-2 text-stone-300">
						<ChevronRight size={20} strokeWidth={1.5} />
					</div>
				{/if}
				<div
					class="max-w-[260px] flex-1 basis-[220px] rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm"
				>
					<div
						class="mb-4 flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700"
						style="font-family: 'Space Mono', monospace;"
					>
						{card.step}
					</div>
					<div
						class="mb-3.5 inline-flex text-green-600"
						style="animation: float 3s ease-in-out {card.delay}s infinite;"
					>
						<CardIcon size={28} strokeWidth={1.3} />
					</div>
					<div class="mb-1.5 text-[15px] font-bold text-stone-900">{card.title}</div>
					<div class="min-h-[3.75rem] text-[12.5px] leading-relaxed text-stone-600">{card.desc}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ============================================================ -->
<!-- FAQ                                                           -->
<!-- ============================================================ -->
<section class="px-6 py-12">
	<div class="mx-auto max-w-2xl">
		<h2 class="mb-2 text-center text-xl font-bold tracking-tight text-stone-900">
			Frequently Asked Questions
		</h2>
		<p class="mb-8 text-center text-[13px] text-stone-400">
			Everything you need to know about Treetag
		</p>

		<div class="flex flex-col gap-2">
			{#each faqs as faq}
				<details class="group rounded-xl border border-stone-200 bg-white">
					<summary
						class="flex cursor-pointer select-none items-center justify-between p-4 text-sm font-semibold text-stone-900"
					>
						{faq.q}
						<span
							class="shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-90"
						>
							<ChevronRight size={16} />
						</span>
					</summary>
					<div class="px-4 pb-4 text-sm leading-relaxed text-stone-600">
						{faq.a}
					</div>
				</details>
			{/each}
		</div>
	</div>
</section>

