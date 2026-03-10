<script lang="ts">
	import QRCode from 'qrcode';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {
		TreePine,
		MapPin,
		Ruler,
		Calendar,
		User,
		Heart,
		Tag,
		Camera,
		QrCode,
		Share2,
		Edit,
		Eye,
		Bug,
		AlertTriangle,
		FileText,
		Leaf,
		Award,
		Clock,
		ArrowLeft,
		Sparkles,
		HeartHandshake,
		Clipboard,
		Check,
		ShieldCheck,
		ShieldX,
		CircleDashed
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	const tree = $derived(data.tree);
	const observations = $derived(data.observations);

	let selectedPhoto = $state(0);
	let showQR = $state(false);
	let copiedLink = $state(false);
	let qrCanvas = $state<HTMLCanvasElement | null>(null);

	const treeUrl = $derived(`${data.appUrl}/t/${tree.qrCodeId}`);

	$effect(() => {
		if (form?.success) toast.success(form.success);
		if (form?.error) toast.error(form.error);
	});

	$effect(() => {
		if (showQR && qrCanvas) {
			QRCode.toCanvas(qrCanvas, treeUrl, {
				width: 180,
				margin: 2,
				color: { dark: '#1c1917', light: '#fafaf9' }
			});
		}
	});

	function copyLink() {
		navigator.clipboard.writeText(treeUrl);
		copiedLink = true;
		toast.success('Link copied to clipboard!');
		setTimeout(() => copiedLink = false, 2000);
	}

	function getObservationIcon(type: string) {
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

	function getObservationLabel(type: string) {
		switch (type) {
			case 'tag': return 'Tagged this tree';
			case 'health_check': return 'Health Check';
			case 'wildlife': return 'Wildlife Sighting';
			case 'disease': return 'Disease Report';
			case 'photo': return 'Photo Added';
			case 'note': return 'Note';
			default: return 'Observation';
		}
	}

	function getHealthBadgeColour(status: string | null) {
		switch (status) {
			case 'healthy': return 'bg-green-100 text-green-700';
			case 'concern': return 'bg-amber-100 text-amber-700';
			case 'diseased': return 'bg-red-100 text-red-700';
			case 'dead': return 'bg-stone-200 text-stone-600';
			default: return 'bg-stone-100 text-stone-500';
		}
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return null;
		return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function timeAgo(dateStr: string | null) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHrs = Math.floor(diffMins / 60);
		if (diffHrs < 24) return `${diffHrs}h ago`;
		const diffDays = Math.floor(diffHrs / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		return formatDate(dateStr) ?? '';
	}

	function getInitials(name: string) {
		return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
	}
</script>

<svelte:head>
	<title>{tree.name} — Treetag</title>
	<meta name="description" content="{tree.species} in {tree.location.address ?? 'Charlton Kings'}. Discover, tag, and care for this tree on Treetag." />
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-8">
	<a href="/trees" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to trees
	</a>

	{#if tree.status === 'pending'}
		<div class="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
			<CircleDashed size={18} class="mt-0.5 flex-shrink-0 text-amber-600" />
			<div class="flex-1">
				<p class="text-[14px] font-semibold text-amber-800">Pending Approval</p>
				<p class="mt-0.5 text-[13px] text-amber-700">This tree has been submitted and is waiting for admin approval before it appears publicly.</p>
				{#if data.isAdmin}
					<div class="mt-3 flex gap-2">
						<form method="POST" action="?/approve" use:enhance>
							<Button type="submit" class="gap-1.5 rounded-[10px] bg-green-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-green-700">
								<ShieldCheck size={14} />
								Approve
							</Button>
						</form>
						<form method="POST" action="?/reject" use:enhance>
							<Button type="submit" variant="outline" class="gap-1.5 rounded-[10px] border-red-200 px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50">
								<ShieldX size={14} />
								Reject
							</Button>
						</form>
					</div>
				{/if}
			</div>
		</div>
	{:else if tree.status === 'rejected'}
		<div class="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
			<ShieldX size={18} class="mt-0.5 flex-shrink-0 text-red-600" />
			<div class="flex-1">
				<p class="text-[14px] font-semibold text-red-800">Rejected</p>
				<p class="mt-0.5 text-[13px] text-red-700">This submission was not approved and remains hidden from public listings.</p>
				{#if data.isAdmin}
					<div class="mt-3">
						<form method="POST" action="?/approve" use:enhance>
							<Button type="submit" class="gap-1.5 rounded-[10px] bg-green-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-green-700">
								<ShieldCheck size={14} />
								Approve Instead
							</Button>
						</form>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="grid gap-8 lg:grid-cols-[1fr_380px]">
		<!-- Main Content -->
		<div class="space-y-8">
			<!-- Photo Gallery -->
			{#if tree.photos.length > 0}
				<div class="space-y-3">
					<div class="relative aspect-[16/9] overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
						<img
							src={tree.photos[selectedPhoto]?.url}
							alt={tree.photos[selectedPhoto]?.caption ?? tree.name}
							class="h-full w-full object-cover"
						/>
					</div>
					{#if tree.photos.length > 1}
						<div class="flex gap-2 overflow-x-auto pb-1">
							{#each tree.photos as photo, i}
								<button
									onclick={() => selectedPhoto = i}
									class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all {i === selectedPhoto ? 'border-green-500 ring-2 ring-green-200' : 'border-stone-200 hover:border-stone-300'}"
								>
									<img src={photo.url} alt={photo.caption ?? `Photo ${i + 1}`} class="h-full w-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<div class="flex aspect-[16/9] items-center justify-center rounded-2xl border border-stone-200 bg-gradient-to-br from-green-50 to-emerald-50">
					<div class="text-center">
						<TreePine size={48} class="mx-auto text-green-300" />
						<p class="mt-2 text-[13px] text-stone-400">No photos yet</p>
					</div>
				</div>
			{/if}

			<!-- Tree Header -->
			<div>
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 class="text-2xl font-bold text-stone-900 sm:text-3xl" style="font-family: 'Playfair Display', serif;">
							{tree.name}
						</h1>
						<p class="mt-1 text-[15px] text-stone-500">{tree.species}</p>
					</div>
					<div class="flex gap-2">
						{#if data.isAdmin || (data.userId === tree.createdBy?.id && tree.status === 'pending')}
							<Button
								variant="outline"
								href="/trees/{tree.id}/edit"
								class="gap-2 rounded-[10px] border-stone-200 text-[13px] font-medium text-stone-600"
							>
								<Edit size={14} />
								Edit
							</Button>
						{/if}
					</div>
				</div>

				{#if tree.tags.length > 0}
					<div class="mt-3 flex flex-wrap gap-1.5">
						{#each tree.tags as tag}
							<Badge variant="secondary" class="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
								{tag}
							</Badge>
						{/each}
					</div>
				{/if}

				{#if tree.description}
					<p class="mt-4 text-[14px] leading-relaxed text-stone-600">{tree.description}</p>
				{/if}
			</div>

			<Separator class="bg-stone-100" />

			<!-- Details Grid -->
			<div class="grid gap-4 sm:grid-cols-2">
				{#if tree.location.address}
					<div class="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
						<MapPin size={16} class="mt-0.5 text-green-600" />
						<div>
							<p class="text-[12px] font-medium text-stone-400">Location</p>
							<p class="text-[14px] text-stone-700">{tree.location.address}</p>
						</div>
					</div>
				{/if}
				{#if tree.estimatedAge}
					<div class="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
						<Clock size={16} class="mt-0.5 text-green-600" />
						<div>
							<p class="text-[12px] font-medium text-stone-400">Estimated Age</p>
							<p class="text-[14px] text-stone-700">~{tree.estimatedAge} years</p>
						</div>
					</div>
				{/if}
				{#if tree.height}
					<div class="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
						<Ruler size={16} class="mt-0.5 text-green-600" />
						<div>
							<p class="text-[12px] font-medium text-stone-400">Height</p>
							<p class="text-[14px] text-stone-700">{tree.height}m</p>
						</div>
					</div>
				{/if}
				{#if tree.trunkDiameter}
					<div class="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
						<TreePine size={16} class="mt-0.5 text-green-600" />
						<div>
							<p class="text-[12px] font-medium text-stone-400">Trunk Diameter</p>
							<p class="text-[14px] text-stone-700">{tree.trunkDiameter}cm</p>
						</div>
					</div>
				{/if}
				{#if tree.plantedDate}
					<div class="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
						<Calendar size={16} class="mt-0.5 text-green-600" />
						<div>
							<p class="text-[12px] font-medium text-stone-400">Planted</p>
							<p class="text-[14px] text-stone-700">{formatDate(tree.plantedDate)}{tree.plantedBy ? ` by ${tree.plantedBy}` : ''}</p>
						</div>
					</div>
				{/if}
				{#if tree.features.length > 0}
					<div class="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
						<Sparkles size={16} class="mt-0.5 text-green-600" />
						<div>
							<p class="text-[12px] font-medium text-stone-400">Features</p>
							<p class="text-[14px] text-stone-700">{tree.features.join(', ')}</p>
						</div>
					</div>
				{/if}
			</div>

			<Separator class="bg-stone-100" />

			<!-- Observations Timeline -->
			<div>
				<h2 class="mb-4 text-lg font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
					Observations
				</h2>

				{#if observations.length > 0}
					<div class="space-y-4">
						{#each observations as obs}
							{@const ObsIcon = getObservationIcon(obs.type)}
							<div class="relative rounded-xl border border-stone-100 bg-white p-4 transition-colors hover:border-stone-200">
								<div class="flex items-start gap-3">
									<div class="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
										<ObsIcon size={16} />
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<a href="/@{obs.user.username}" class="text-[13px] font-semibold text-stone-800 hover:text-green-600 transition-colors">
												{obs.user.name}
											</a>
											<span class="text-[12px] text-stone-400">{getObservationLabel(obs.type)}</span>
											{#if obs.healthStatus}
												<span class="rounded-full px-2 py-0.5 text-[11px] font-medium {getHealthBadgeColour(obs.healthStatus)}">
													{obs.healthStatus}
												</span>
											{/if}
											{#if obs.pointsAwarded > 0}
												<span class="text-[11px] text-amber-600 font-medium">+{obs.pointsAwarded} pts</span>
											{/if}
										</div>
										{#if obs.content}
											<p class="mt-1 text-[13px] text-stone-600">{obs.content}</p>
										{/if}
										{#if obs.wildlife?.species}
											<p class="mt-1 text-[13px] text-stone-600">
												Spotted: <span class="font-medium">{obs.wildlife.species}</span>
												{#if obs.wildlife.category}
													<span class="text-stone-400">({obs.wildlife.category})</span>
												{/if}
											</p>
										{/if}
										{#if obs.photos.length > 0}
											<div class="mt-2 flex gap-2 overflow-x-auto">
												{#each obs.photos as photo}
													<img
														src={photo.url}
														alt={photo.caption ?? 'Observation photo'}
														class="h-20 w-20 flex-shrink-0 rounded-lg border border-stone-200 object-cover"
													/>
												{/each}
											</div>
										{/if}
										<p class="mt-1.5 text-[11px] text-stone-400">{timeAgo(obs.createdAt)}</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="rounded-xl border border-stone-100 bg-stone-50/50 p-8 text-center">
						<Eye size={32} class="mx-auto text-stone-300" />
						<p class="mt-2 text-[13px] text-stone-400">No observations yet. Be the first to tag this tree!</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-5">
			<!-- Quick Actions -->
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-[14px] font-bold text-stone-800">Quick Actions</h3>
				<div class="space-y-2.5">
					{#if data.isLoggedIn}
						<Button
							href="/trees/{tree.id}/observe"
							class="w-full gap-2 rounded-[10px] bg-gradient-to-r from-green-600 to-emerald-500 py-2.5 text-[13px] font-semibold text-white shadow-sm"
						>
							<Tag size={14} />
							Tag This Tree
						</Button>
					{:else}
						<Button
							href="/auth/login"
							class="w-full gap-2 rounded-[10px] bg-gradient-to-r from-green-600 to-emerald-500 py-2.5 text-[13px] font-semibold text-white shadow-sm"
						>
							<User size={14} />
							Log in to Tag
						</Button>
					{/if}

					<button
						onclick={copyLink}
						class="flex w-full items-center justify-center gap-2 rounded-[10px] border border-stone-200 bg-white px-4 py-2.5 text-[13px] font-medium text-stone-600 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-700"
					>
						{#if copiedLink}
							<Check size={14} class="text-green-600" />
							Copied!
						{:else}
							<Share2 size={14} />
							Share Tree
						{/if}
					</button>

					<button
						onclick={() => showQR = !showQR}
						class="flex w-full items-center justify-center gap-2 rounded-[10px] border border-stone-200 bg-white px-4 py-2.5 text-[13px] font-medium text-stone-600 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-700"
					>
						<QrCode size={14} />
						{showQR ? 'Hide' : 'Show'} QR Code
					</button>
				</div>

				{#if showQR}
					<div class="mt-4 rounded-xl border border-stone-100 bg-stone-50 p-4 text-center">
						<div class="mx-auto flex items-center justify-center">
							<canvas bind:this={qrCanvas} class="rounded-lg"></canvas>
						</div>
						<p class="mt-2 text-[11px] text-stone-400 break-all">{treeUrl}</p>
					</div>
				{/if}
			</div>

			<!-- Adoption Status -->
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
				<h3 class="mb-3 text-[14px] font-bold text-stone-800">Adoption</h3>
				{#if tree.adoptedBy}
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-xs font-bold text-white overflow-hidden">
							{#if tree.adoptedBy.avatar}
								<img src={tree.adoptedBy.avatar} alt={tree.adoptedBy.name} class="h-full w-full object-cover" />
							{:else}
								{getInitials(tree.adoptedBy.name)}
							{/if}
						</div>
						<div>
							<a href="/@{tree.adoptedBy.username}" class="text-[13px] font-semibold text-stone-800 hover:text-green-600 transition-colors">
								{tree.adoptedBy.name}
							</a>
							<p class="text-[11px] text-stone-400">
								Adopted {formatDate(tree.adoptedAt)}
							</p>
						</div>
					</div>
				{:else}
					<div class="text-center">
						<Heart size={24} class="mx-auto text-stone-300" />
						<p class="mt-2 text-[13px] text-stone-500">This tree is looking for a guardian!</p>
						{#if data.isLoggedIn}
							<form method="POST" action="?/adopt" class="mt-3">
								<Button
									type="submit"
									variant="outline"
									class="w-full gap-2 rounded-[10px] border-green-200 text-[13px] font-medium text-green-600 hover:bg-green-50"
								>
									<Heart size={14} />
									Adopt This Tree
								</Button>
							</form>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Tree Info Card -->
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
				<h3 class="mb-3 text-[14px] font-bold text-stone-800">Tree Info</h3>
				<dl class="space-y-2.5 text-[13px]">
					<div class="flex justify-between">
						<dt class="text-stone-400">Species</dt>
						<dd class="font-medium text-stone-700">{tree.species}</dd>
					</div>
					<Separator class="bg-stone-50" />
					<div class="flex justify-between">
						<dt class="text-stone-400">Registered</dt>
						<dd class="font-medium text-stone-700">{formatDate(tree.createdAt)}</dd>
					</div>
					<Separator class="bg-stone-50" />
					<div class="flex justify-between">
						<dt class="text-stone-400">Observations</dt>
						<dd class="font-medium text-stone-700">{observations.length}</dd>
					</div>
					<Separator class="bg-stone-50" />
					<div class="flex justify-between">
						<dt class="text-stone-400">Photos</dt>
						<dd class="font-medium text-stone-700">{tree.photos.length}</dd>
					</div>
					{#if tree.createdBy}
						<Separator class="bg-stone-50" />
						<div class="flex justify-between">
							<dt class="text-stone-400">Added by</dt>
							<dd>
								<a href="/@{tree.createdBy.username}" class="font-medium text-green-600 hover:text-green-700 transition-colors">
									{tree.createdBy.name}
								</a>
							</dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Coordinates -->
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
				<h3 class="mb-3 text-[14px] font-bold text-stone-800">Coordinates</h3>
				<p class="font-mono text-[13px] text-stone-600">
					{tree.location.coordinates[1].toFixed(6)}, {tree.location.coordinates[0].toFixed(6)}
				</p>
				<a
					href="https://www.openstreetmap.org/?mlat={tree.location.coordinates[1]}&mlon={tree.location.coordinates[0]}#map=18/{tree.location.coordinates[1]}/{tree.location.coordinates[0]}"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-green-600 transition-colors hover:text-green-700"
				>
					<MapPin size={12} />
					View on OpenStreetMap
				</a>
			</div>
		</div>
	</div>
</div>
