<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import {
		Search,
		ArrowLeft,
		ChevronLeft,
		ChevronRight,
		ShieldCheck,
		User as UserIcon,
		Mail,
		ExternalLink,
		BadgeCheck,
		Award
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();
	let searchValue = $state(data.filters.search);
	let roleValue = $state(data.filters.role);
	let searchTimeout: ReturnType<typeof setTimeout>;

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (roleValue) params.set('role', roleValue);
		const qs = params.toString();
		goto(`/admin/users${qs ? `?${qs}` : ''}`, { keepFocus: true });
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(applyFilters, 400);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (roleValue) params.set('role', roleValue);
		params.set('page', String(p));
		goto(`/admin/users?${params.toString()}`);
	}

	function getInitials(name: string) {
		return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
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

	function formatDate(dateStr: string | null) {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const f = form as any;
		if (f?.success) toast.success(f.success);
		if (f?.error) toast.error(f.error);
	});
</script>

<svelte:head>
	<title>Manage Users — Admin — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-10">
	<a href="/admin" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to dashboard
	</a>

	<div class="mb-8">
		<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
			Manage Users
		</h1>
		<p class="mt-1 text-[14px] text-stone-400">
			{data.total.toLocaleString()} user{data.total === 1 ? '' : 's'} total.
		</p>
	</div>

	<!-- Filters -->
	<div class="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
		<div class="relative flex-1 min-w-[200px]">
			<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
			<Input
				placeholder="Search by name, username, or email…"
				bind:value={searchValue}
				oninput={handleSearch}
				class="h-auto rounded-[10px] border-stone-200 bg-white py-2 pl-9 text-[13px] focus-visible:border-green-400 focus-visible:ring-green-100"
			/>
		</div>
		<div class="flex gap-1">
			{#each [{ value: '', label: 'All' }, { value: 'guardian', label: 'Guardians' }, { value: 'admin', label: 'Admins' }] as opt}
				<button
					type="button"
					onclick={() => { roleValue = opt.value; applyFilters(); }}
					class="rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition-colors {roleValue === opt.value ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-stone-500 hover:bg-stone-100'}"
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
		{#if data.users.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-[13px]">
					<thead class="border-b border-stone-200 bg-stone-50/60 text-[12px] font-semibold uppercase tracking-wider text-stone-500">
						<tr>
							<th class="px-4 py-3">User</th>
							<th class="px-4 py-3">Role</th>
							<th class="px-4 py-3">Level</th>
							<th class="px-4 py-3">Points</th>
							<th class="px-4 py-3">Trees</th>
							<th class="px-4 py-3">Obs.</th>
							<th class="px-4 py-3">Joined</th>
							<th class="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.users as user}
							<tr class="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/40">
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-[11px] font-bold text-white overflow-hidden">
											{#if user.avatar}
												<img src={user.avatar} alt={user.name} class="h-full w-full object-cover" />
											{:else}
												{getInitials(user.name)}
											{/if}
										</div>
										<div class="min-w-0">
											<div class="flex items-center gap-1.5">
												<a href="/@{user.username}" class="block max-w-[260px] truncate font-semibold text-stone-800 hover:text-green-600">{user.name}</a>
												{#if user.emailVerified}
													<span title="Email verified" class="shrink-0">
														<BadgeCheck size={13} class="text-green-500" />
													</span>
												{/if}
											</div>
											<p class="max-w-[280px] truncate text-[11px] text-stone-500">@{user.username} · {user.email}</p>
										</div>
									</div>
								</td>
								<td class="px-4 py-3">
									<Badge class="gap-1 rounded-full px-2 py-0.5 text-[11px] capitalize {user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}">
										{#if user.role === 'admin'}
											<ShieldCheck size={11} />
										{:else}
											<UserIcon size={11} />
										{/if}
										{user.role}
									</Badge>
								</td>
								<td class="px-4 py-3">
									<span class="rounded-full px-2 py-0.5 text-[11px] font-medium {levelClasses(user.level.colour)}">
										{user.level.title}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex items-center gap-1 text-stone-700">
										<Award size={12} class="text-amber-500" />
										{user.points.toLocaleString()}
									</span>
								</td>
								<td class="px-4 py-3 text-stone-600">{user.adoptedTrees}</td>
								<td class="px-4 py-3 text-stone-600">{user.observations}</td>
								<td class="px-4 py-3 text-stone-500">{formatDate(user.createdAt)}</td>
								<td class="px-4 py-3">
									<div class="flex justify-end gap-1.5">
										<Button variant="ghost" href="/@{user.username}" class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800" title="View profile">
											<ExternalLink size={14} />
										</Button>
										<Button variant="ghost" href="mailto:{user.email}" class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800" title="Email">
											<Mail size={14} />
										</Button>
										<form method="POST" action="?/setRole" use:enhance>
											<input type="hidden" name="userId" value={user.id} />
											<input type="hidden" name="role" value={user.role === 'admin' ? 'guardian' : 'admin'} />
											<Button
												type="submit"
												variant="outline"
												class="h-auto gap-1 rounded-[8px] border-stone-200 px-2 py-1 text-[11px] font-medium {user.role === 'admin' ? 'text-stone-600 hover:border-stone-300' : 'text-purple-600 hover:border-purple-300 hover:bg-purple-50'}"
												title={user.role === 'admin' ? 'Demote to guardian' : 'Promote to admin'}
											>
												{user.role === 'admin' ? 'Demote' : 'Promote'}
											</Button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="px-6 py-16 text-center">
				<p class="text-[14px] text-stone-500">No users match these filters.</p>
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
