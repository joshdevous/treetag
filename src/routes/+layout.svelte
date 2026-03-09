<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { signOut } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { children, data } = $props();

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/trees', label: 'Map View' },
		{ href: '/trees/browse', label: 'Tree Lookup' },
		{ href: '/faq', label: 'FAQ' }
	];

	async function handleSignOut() {
		await signOut();
		goto('/');
	}
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-b border-border bg-background">
		<nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<a href="/" class="flex items-center gap-2 font-bold text-lg">
				<span class="text-2xl">🌳</span>
				Treetag
			</a>

			<ul class="hidden items-center gap-6 md:flex">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="text-sm font-medium transition-colors hover:text-foreground/80
								{$page.url.pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}"
						>
							{link.label}
						</a>
					</li>
				{/each}
				{#if data.user?.role === 'admin' || data.user?.role === 'guardian'}
					<li>
						<a href="/trees/new" class="text-sm font-medium text-muted-foreground hover:text-foreground/80">
							Register a Tree
						</a>
					</li>
				{/if}
			</ul>

			<div class="flex items-center gap-2">
				{#if data.user}
					<span class="hidden text-sm text-muted-foreground sm:block">{data.user.name}</span>
					<a href="/profile" class="text-sm font-medium hover:underline">Profile</a>
					<button
						onclick={handleSignOut}
						class="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
					>
						Log Out
					</button>
				{:else}
					<a
						href="/auth/login"
						class="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
					>
						Log In
					</a>
					<a
						href="/auth/register"
						class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Sign Up
					</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-border py-6 text-center text-sm text-muted-foreground">
		Treetag &mdash; Charlton Kings Tree Guardian Project
	</footer>
</div>

