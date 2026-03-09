<script lang="ts">
	import { signUp } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		loading = true;
		error = '';

		const { error: err } = await signUp.email({ name, email, password });
		if (err) {
			error = err.message ?? 'Registration failed. Please try again.';
		} else {
			goto('/');
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Sign Up — Treetag</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="space-y-1 text-center">
			<h1 class="text-2xl font-bold">Become a Tree Guardian</h1>
			<p class="text-sm text-muted-foreground">Create your account to start tagging trees</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			{#if error}
				<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
			{/if}

			<div class="space-y-1.5">
				<label for="name" class="text-sm font-medium">Full Name</label>
				<input
					id="name"
					type="text"
					autocomplete="name"
					required
					bind:value={name}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="email" class="text-sm font-medium">Email</label>
				<input
					id="email"
					type="email"
					autocomplete="email"
					required
					bind:value={email}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="password" class="text-sm font-medium">Password</label>
				<input
					id="password"
					type="password"
					autocomplete="new-password"
					required
					minlength={8}
					bind:value={password}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
				<input
					id="confirmPassword"
					type="password"
					autocomplete="new-password"
					required
					minlength={8}
					bind:value={confirmPassword}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
			>
				{loading ? 'Creating account...' : 'Create Account'}
			</button>
		</form>

		<p class="text-center text-sm text-muted-foreground">
			Already have an account?
			<a href="/auth/login" class="font-medium underline underline-offset-4">Log in</a>
		</p>
	</div>
</div>
