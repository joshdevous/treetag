<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import {
		Search,
		ArrowLeft,
		ChevronLeft,
		ChevronRight,
		Trash2,
		ExternalLink,
		Edit,
		ShieldCheck,
		CircleDashed,
		ShieldX,
		Heart,
		Camera
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	let { data, form } = $props();
	let searchValue = $state(data.filters.search);
	let statusValue = $state(data.filters.status);
	let confirmId = $state<string | null>(null);
	let confirmName = $state<string>('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (statusValue) params.set('status', statusValue);
		const qs = params.toString();
		goto(`/admin/trees${qs ? `?${qs}` : ''}`, { keepFocus: true });
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(applyFilters, 400);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (statusValue) params.set('status', statusValue);
		params.set('page', String(p));
		goto(`/admin/trees?${params.toString()}`);
	}

	function statusInfo(status: string) {
		switch (status) {
			case 'approved': return { Icon: ShieldCheck, label: 'Approved', class: 'bg-green-100 text-green-700' };
			case 'pending': return { Icon: CircleDashed, label: 'Pending', class: 'bg-amber-100 text-amber-700' };
			case 'rejected': return { Icon: ShieldX, label: 'Rejected', class: 'bg-red-100 text-red-700' };
			default: return { Icon: ShieldCheck, label: status, class: 'bg-stone-100 text-stone-600' };
		}
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function openConfirm(id: string, name: string) {
		confirmId = id;
		confirmName = name;
	}

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const f = form as any;
		if (f?.success) {
			toast.success(f.success);
			confirmId = null;
		}
		if (f?.error) toast.error(f.error);
	});
</script>

<svelte:head>
	<title>Manage Trees — Admin — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-10">
	<a href="/admin" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to dashboard
	</a>

	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
				Manage Trees
			</h1>
			<p class="mt-1 text-[14px] text-stone-400">
				{data.total.toLocaleString()} tree{data.total === 1 ? '' : 's'} total.
			</p>
		</div>
		<Button href="/trees/new" class="gap-2 rounded-[10px] bg-linear-to-r from-green-600 to-emerald-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm">
			Register a Tree
		</Button>
	</div>

	<!-- Filters -->
	<div class="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
		<div class="relative flex-1 min-w-[200px]">
			<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
			<Input
				placeholder="Search by name, species, or address…"
				bind:value={searchValue}
				oninput={handleSearch}
				class="h-auto rounded-[10px] border-stone-200 bg-white py-2 pl-9 text-[13px] focus-visible:border-green-400 focus-visible:ring-green-100"
			/>
		</div>
		<div class="flex gap-1">
			{#each [{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] as opt}
				<button
					type="button"
					onclick={() => { statusValue = opt.value; applyFilters(); }}
					class="rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition-colors {statusValue === opt.value ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-stone-500 hover:bg-stone-100'}"
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
		{#if data.trees.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-[13px]">
					<thead class="border-b border-stone-200 bg-stone-50/60 text-[12px] font-semibold uppercase tracking-wider text-stone-500">
						<tr>
							<th class="px-4 py-3">Tree</th>
							<th class="px-4 py-3">Status</th>
							<th class="px-4 py-3">Location</th>
							<th class="px-4 py-3">Photos</th>
							<th class="px-4 py-3">Adopted</th>
							<th class="px-4 py-3">Added</th>
							<th class="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.trees as tree}
							{@const status = statusInfo(tree.status)}
							<tr class="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/40">
								<td class="px-4 py-3">
									<a href="/trees/{tree.id}" class="font-semibold text-stone-800 hover:text-green-600">{tree.name}</a>
									<p class="text-[11px] text-stone-500">{tree.species}</p>
								</td>
								<td class="px-4 py-3">
									<Badge class="gap-1 rounded-full px-2 py-0.5 text-[11px] {status.class}">
										<status.Icon size={11} />
										{status.label}
									</Badge>
								</td>
								<td class="px-4 py-3 text-stone-600">
									<span class="line-clamp-1 max-w-[220px]">{tree.location || '—'}</span>
								</td>
								<td class="px-4 py-3 text-stone-600">
									<span class="inline-flex items-center gap-1">
										<Camera size={12} class="text-stone-400" />
										{tree.photoCount}
									</span>
								</td>
								<td class="px-4 py-3">
									{#if tree.adopted}
										<Heart size={13} class="text-rose-500" />
									{:else}
										<span class="text-stone-300">—</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-stone-500">{formatDate(tree.createdAt)}</td>
								<td class="px-4 py-3">
									<div class="flex justify-end gap-1">
										<Button variant="ghost" href="/trees/{tree.id}" class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800" title="View">
											<ExternalLink size={14} />
										</Button>
										<Button variant="ghost" href="/trees/{tree.id}/edit" class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800" title="Edit">
											<Edit size={14} />
										</Button>
										<Button
											variant="ghost"
											onclick={() => openConfirm(tree.id, tree.name)}
											class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600"
											title="Delete"
										>
											<Trash2 size={14} />
										</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="px-6 py-16 text-center">
				<p class="text-[14px] text-stone-500">No trees match these filters.</p>
			</div>
		{/if}
	</div>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<div class="mt-4 flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3">
			<p class="text-[12px] text-stone-500">
				Page {data.page} of {data.totalPages} — {data.total.toLocaleString()} total
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
</div>

<AlertDialog.Root open={confirmId !== null} onOpenChange={(open) => { if (!open) confirmId = null; }}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete tree?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete <span class="font-semibold text-stone-800">{confirmName}</span>, all its observations, and all linked photos (including from R2 storage). This cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="treeId" value={confirmId} />
				<AlertDialog.Action type="submit" class="bg-red-600 text-white hover:bg-red-700">
					Delete permanently
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
