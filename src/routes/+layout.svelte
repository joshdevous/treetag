<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { signOut } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { TreePine, User, Settings, LogOut, ChevronDown, Menu, X, Shield } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Toaster } from 'svelte-sonner';

	let { children, data } = $props();
	let dropdownOpen = $state(false);
	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/trees', label: 'Explore' },
		{ href: '/leaderboard', label: 'Leaderboard' },
		{ href: '/faq', label: 'FAQ' }
	];

	function getInitials(name: string) {
		return name
			.split(' ')
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	}

	async function handleSignOut() {
		dropdownOpen = false;
		await signOut();
		await invalidateAll();
		goto('/');
	}
</script>

<Toaster richColors position="bottom-center" />

{#if $page.url.pathname.startsWith('/auth/')}
	{@render children()}
{:else}
	<div class="flex min-h-screen flex-col">
		<header class="sticky top-0 z-50 border-b border-stone-200/60 bg-white/70 backdrop-blur-md">
			<nav class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
				<a href="/" class="flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-green-600 to-green-500"
						style="box-shadow: 0 2px 8px rgba(22,163,74,0.2);"
					>
						<TreePine size={17} color="#fff" strokeWidth={2.5} />
					</div>
					<span class="text-[17px] tracking-tight">
						<span class="font-bold text-stone-900">Tree</span><span
							class="font-normal text-green-600">tag</span
						>
					</span>
				</a>

				<div class="hidden items-center gap-0.5 md:flex">
					{#each navLinks as link}
						{@const isActive = $page.url.pathname === link.href}
						<a
							href={link.href}
							class="rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors
								{isActive
								? 'text-green-600'
								: 'text-stone-400 hover:text-stone-700'}"
						>
							{link.label}
						</a>
					{/each}
					{#if data.user}
						<a
							href="/trees/new"
							class="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-700"
						>
							Register a Tree
						</a>
					{/if}
				</div>

				<div class="flex items-center gap-3">
					<button
						class="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 md:hidden"
						onclick={() => mobileMenuOpen = !mobileMenuOpen}
						aria-label="Toggle menu"
					>
						{#if mobileMenuOpen}
							<X size={20} />
						{:else}
							<Menu size={20} />
						{/if}
					</button>
					{#if data.user}
						<DropdownMenu.Root bind:open={dropdownOpen}>
							<DropdownMenu.Trigger class="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-stone-100">
								<div
									class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-[11px] font-bold text-white overflow-hidden"
								>
									{#if (data.user as any).avatar}
										<img src={(data.user as any).avatar} alt={data.user.name} class="h-full w-full object-cover" />
									{:else}
										{getInitials(data.user.name)}
									{/if}
								</div>
								<span class="hidden max-w-[140px] truncate text-[13px] font-medium text-stone-700 sm:block"
									>{data.user.name}</span
								>
								<ChevronDown
									size={14}
									class="hidden text-stone-400 transition-transform sm:block {dropdownOpen
										? 'rotate-180'
										: ''}"
								/>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content align="end" class="w-52 rounded-xl shadow-lg shadow-stone-200/60">
								<DropdownMenu.Label class="px-3.5 pb-2.5 pt-2">
									<p class="truncate text-[13px] font-medium text-stone-800">{data.user.name}</p>
									<p class="truncate text-[12px] font-normal text-stone-400">@{data.user.username}</p>
								</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={() => goto(`/@${data.user?.username}`)} class="gap-2.5 px-3.5 py-2 text-[13px] text-stone-600">
									<User size={15} class="text-stone-400" />
									Profile
								</DropdownMenu.Item>
								<DropdownMenu.Item onclick={() => goto('/settings')} class="gap-2.5 px-3.5 py-2 text-[13px] text-stone-600">
									<Settings size={15} class="text-stone-400" />
									Settings
								</DropdownMenu.Item>
								{#if (data.user as any).role === 'admin'}
									<DropdownMenu.Separator />
									<DropdownMenu.Item onclick={() => goto('/admin')} class="gap-2.5 px-3.5 py-2 text-[13px] text-stone-600">
										<Shield size={15} class="text-stone-400" />
										Admin
									</DropdownMenu.Item>
								{/if}
								<DropdownMenu.Separator />
								<DropdownMenu.Item variant="destructive" onclick={handleSignOut} class="gap-2.5 px-3.5 py-2 text-[13px]">
									<LogOut size={15} />
									Log Out
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<Button variant="ghost" href="/auth/login" class="text-[13px] font-medium text-stone-500 hover:text-stone-900 hover:bg-transparent h-auto px-0">
							Log In
						</Button>
						<Button variant="outline" href="/auth/register" class="rounded-lg border-green-600/30 px-4 py-1.5 text-[13px] font-semibold text-green-600 hover:bg-green-50 hover:border-green-600/50 h-auto">
							Sign Up
						</Button>
					{/if}
				</div>
			</nav>

			{#if mobileMenuOpen}
				<div transition:slide={{ duration: 200 }} class="border-t border-stone-200/60 bg-white px-6 py-3 md:hidden">
					<div class="flex flex-col gap-1">
						{#each navLinks as link}
							{@const isActive = $page.url.pathname === link.href}
							<a
								href={link.href}
								onclick={() => mobileMenuOpen = false}
								class="rounded-md px-3 py-2 text-[14px] font-medium transition-colors
									{isActive
									? 'bg-green-50 text-green-600'
									: 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}"
							>
								{link.label}
							</a>
						{/each}
						{#if data.user}
							<a
								href="/trees/new"
								onclick={() => mobileMenuOpen = false}
								class="rounded-md px-3 py-2 text-[14px] font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
							>
								Register a Tree
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</header>

		<main class="flex-1">
			{@render children()}
		</main>

		<footer class="border-t border-stone-200 bg-stone-50/60">
			<div class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-between">
				<div class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center rounded-[7px] bg-gradient-to-br from-green-600 to-green-500"
					>
						<TreePine size={13} color="#fff" strokeWidth={2.5} />
					</div>
					<span class="text-[13px] text-stone-400">
						&copy; {new Date().getFullYear()} Treetag &mdash; Charlton Kings Tree Guardian Project
					</span>
				</div>
				<div class="flex items-center gap-4">
					<a href="/legal" class="text-[12.5px] text-stone-400 transition-colors hover:text-stone-600">Legal & Privacy</a>
				</div>
			</div>
		</footer>
	</div>
{/if}

