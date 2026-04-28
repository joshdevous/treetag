<script lang="ts">
	import {
		TreePine,
		Eye,
		Camera,
		Users,
		ShieldCheck,
		ShieldX,
		CircleDashed,
		Heart,
		ArrowRight,
		Tag,
		HeartHandshake,
		Leaf,
		AlertTriangle,
		FileText
	} from 'lucide-svelte';

	let { data } = $props();
	const { stats, recentTrees, recentObservations } = $derived(data);

	function statusBadge(status: string) {
		switch (status) {
			case 'approved':
				return { label: 'Approved', class: 'bg-green-100 text-green-700' };
			case 'pending':
				return { label: 'Pending', class: 'bg-amber-100 text-amber-700' };
			case 'rejected':
				return { label: 'Rejected', class: 'bg-red-100 text-red-700' };
			default:
				return { label: status, class: 'bg-stone-100 text-stone-600' };
		}
	}

	function obsIcon(type: string) {
		switch (type) {
			case 'tag': return Tag;
			case 'health_check': return HeartHandshake;
			case 'wildlife': return Leaf;
			case 'disease': return AlertTriangle;
			case 'photo': return Camera;
			case 'note': return FileText;
			default: return Eye;
		}
	}

	function timeAgo(dateStr: string | null) {
		if (!dateStr) return '';
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'Just now';
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		return `${days}d ago`;
	}
</script>

<svelte:head>
	<title>Admin Dashboard — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-10">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
			Admin Dashboard
		</h1>
		<p class="mt-1 text-[14px] text-stone-400">
			Overview of trees, observations, and community activity.
		</p>
	</div>

	<!-- Stat tiles -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{@render statTile('Total Trees', stats.totalTrees, TreePine, 'green')}
		{@render statTile('Pending Approval', stats.pendingTrees, CircleDashed, 'amber')}
		{@render statTile('Approved', stats.approvedTrees, ShieldCheck, 'emerald')}
		{@render statTile('Rejected', stats.rejectedTrees, ShieldX, 'red')}
		{@render statTile('Adopted Trees', stats.adoptedTrees, Heart, 'rose')}
		{@render statTile('Observations', stats.totalObservations, Eye, 'blue')}
		{@render statTile('Photos', stats.totalPhotos, Camera, 'purple')}
		{@render statTile('Registered Users', stats.totalUsers, Users, 'stone')}
	</div>

	<!-- Quick links -->
	<div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<a
			href="/admin/trees"
			class="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-green-400 hover:shadow-sm"
		>
			<div>
				<p class="text-[14px] font-semibold text-stone-800">Manage Trees</p>
				<p class="mt-0.5 text-[12px] text-stone-500">Edit, approve, reject, delete</p>
			</div>
			<ArrowRight size={16} class="text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-600" />
		</a>
		<a
			href="/admin/users"
			class="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-purple-400 hover:shadow-sm"
		>
			<div>
				<p class="text-[14px] font-semibold text-stone-800">Manage Users</p>
				<p class="mt-0.5 text-[12px] text-stone-500">Promote / demote, search</p>
			</div>
			<ArrowRight size={16} class="text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-purple-600" />
		</a>
		<a
			href="/admin/faq"
			class="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-blue-400 hover:shadow-sm"
		>
			<div>
				<p class="text-[14px] font-semibold text-stone-800">Manage FAQ</p>
				<p class="mt-0.5 text-[12px] text-stone-500">Add, edit, reorder entries</p>
			</div>
			<ArrowRight size={16} class="text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
		</a>
		<a
			href="/trees?pending=1"
			class="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-amber-400 hover:shadow-sm"
		>
			<div>
				<p class="text-[14px] font-semibold text-stone-800">Review Pending</p>
				<p class="mt-0.5 text-[12px] text-stone-500">{stats.pendingTrees} awaiting approval</p>
			</div>
			<ArrowRight size={16} class="text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600" />
		</a>
	</div>

	<!-- Recent activity -->
	<div class="mt-8 grid gap-6 lg:grid-cols-2">
		<div class="rounded-2xl border border-stone-200 bg-white p-5">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-[15px] font-bold text-stone-800">Recent Trees</h2>
				<a href="/admin/trees" class="text-[12px] font-medium text-green-600 hover:text-green-700">View all →</a>
			</div>
			{#if recentTrees.length > 0}
				<ul class="space-y-2">
					{#each recentTrees as tree}
						{@const badge = statusBadge(tree.status)}
						<li>
							<a href="/trees/{tree.id}" class="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-stone-50">
								<div class="min-w-0">
									<p class="truncate text-[13px] font-semibold text-stone-800">{tree.name}</p>
									<p class="truncate text-[11px] text-stone-500">{tree.species}</p>
								</div>
								<div class="flex items-center gap-3">
									<span class="rounded-full px-2 py-0.5 text-[10px] font-medium {badge.class}">{badge.label}</span>
									<span class="text-[11px] text-stone-400">{timeAgo(tree.createdAt)}</span>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="py-6 text-center text-[13px] text-stone-400">No trees yet.</p>
			{/if}
		</div>

		<div class="rounded-2xl border border-stone-200 bg-white p-5">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-[15px] font-bold text-stone-800">Recent Observations</h2>
			</div>
			{#if recentObservations.length > 0}
				<ul class="space-y-2">
					{#each recentObservations as obs}
						{@const Icon = obsIcon(obs.type)}
						<li>
							<a href={obs.tree ? `/trees/${obs.tree}` : '#'} class="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-stone-50">
								<div class="flex items-center gap-3 min-w-0">
									<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
										<Icon size={14} />
									</div>
									<div class="min-w-0">
										<p class="truncate text-[13px] font-semibold text-stone-800 capitalize">{obs.type.replace('_', ' ')}</p>
										<p class="text-[11px] text-stone-500">+{obs.pointsAwarded} pts</p>
									</div>
								</div>
								<span class="text-[11px] text-stone-400">{timeAgo(obs.createdAt)}</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="py-6 text-center text-[13px] text-stone-400">No observations yet.</p>
			{/if}
		</div>
	</div>
</div>

{#snippet statTile(label: string, value: number, Icon: any, colour: string)}
	{@const palette = {
		green: 'from-green-50 to-green-100 text-green-700',
		amber: 'from-amber-50 to-amber-100 text-amber-700',
		emerald: 'from-emerald-50 to-emerald-100 text-emerald-700',
		red: 'from-red-50 to-red-100 text-red-700',
		rose: 'from-rose-50 to-rose-100 text-rose-700',
		blue: 'from-blue-50 to-blue-100 text-blue-700',
		purple: 'from-purple-50 to-purple-100 text-purple-700',
		stone: 'from-stone-50 to-stone-100 text-stone-700'
	}[colour] ?? 'from-stone-50 to-stone-100 text-stone-700'}
	<div class="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
		<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br {palette}">
			<Icon size={18} />
		</div>
		<div class="min-w-0">
			<p class="text-[12px] font-medium text-stone-400">{label}</p>
			<p class="text-xl font-bold text-stone-800">{value.toLocaleString()}</p>
		</div>
	</div>
{/snippet}
