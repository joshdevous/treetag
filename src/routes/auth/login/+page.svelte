<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let identifier = $state('');
	let password = $state('');
	let loading = $state(false);
	let showPassword = $state(false);
	let identifierFocused = $state(false);
	let passwordFocused = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		const isEmail = identifier.includes('@');
		const { error: err } = isEmail
			? await signIn.email({ email: identifier, password })
			: await signIn.username({ username: identifier, password });
		if (err) {
			toast.error(err.message ?? 'Login failed. Please try again.');
			loading = false;
		} else {
			goto('/', { invalidateAll: true });
		}
	}
</script>

<svelte:head>
	<title>Log In — Treetag</title>
</svelte:head>

<h1 class="auth-heading">Log in to Treetag</h1>
<p class="auth-subtitle">Enter your details to access your trees and observations.</p>

<form onsubmit={handleSubmit}>
	<!-- Email or Username -->
	<div class="mb-4">
		<label for="identifier" class="auth-label">Email or Username</label>
		<div class="auth-input-wrap" class:focused={identifierFocused}>
			<div class="auth-input-icon" class:active={identifierFocused}><User size={16} /></div>
			<input
				id="identifier"
				type="text"
				autocomplete="username"
				required
				placeholder="you@example.com or username"
				bind:value={identifier}
				onfocus={() => (identifierFocused = true)}
				onblur={() => (identifierFocused = false)}
				class="auth-input"
			/>
		</div>
	</div>

	<!-- Password -->
	<div class="mb-4">
		<label for="password" class="auth-label">Password</label>
		<div class="auth-input-wrap" class:focused={passwordFocused}>
			<div class="auth-input-icon" class:active={passwordFocused}><Lock size={16} /></div>
			<input
				id="password"
				type={showPassword ? 'text' : 'password'}
				autocomplete="current-password"
				required
				placeholder="Enter your password"
				bind:value={password}
				onfocus={() => (passwordFocused = true)}
				onblur={() => (passwordFocused = false)}
				class="auth-input"
			/>
			<button type="button" class="auth-input-toggle" onclick={() => (showPassword = !showPassword)}>
				{#if showPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
			</button>
		</div>
	</div>

	<!-- Forgot password -->
	<div class="text-right -mt-2 mb-5">
		<button type="button" class="text-xs font-medium text-green-600 hover:underline bg-transparent border-none cursor-pointer">
			Forgot password?
		</button>
	</div>

	<!-- Submit -->
	<button type="submit" disabled={loading} class="auth-submit">
		{loading ? 'Logging in' : 'Log In'}
		<span class="auth-submit-arrow">
			{#if loading}<span class="auth-spinner"><Loader2 size={16} /></span>{:else}<ArrowRight size={16} />{/if}
		</span>
	</button>
</form>

<style>
	.auth-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.5px;
		margin-bottom: 6px;
		color: #1c1917;
	}

	.auth-subtitle {
		font-size: 14px;
		color: #57534e;
		margin-bottom: 28px;
		line-height: 1.5;
	}

	.auth-label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #57534e;
		margin-bottom: 6px;
		letter-spacing: 0.2px;
	}

	.auth-input-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
		background: #f5f5f4;
		border: 1.5px solid #e7e5e4;
		border-radius: 10px;
		padding: 11px 14px;
		transition: all 0.2s;
	}

	.auth-input-wrap.focused {
		border-color: #16a34a;
		box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.08);
	}

	.auth-input-icon {
		color: #a8a29e;
		display: flex;
		transition: color 0.2s;
	}

	.auth-input-icon.active {
		color: #16a34a;
	}

	.auth-input {
		background: transparent;
		border: none;
		outline: none;
		color: #1c1917;
		font-size: 14px;
		width: 100%;
		font-family: 'DM Sans', system-ui, sans-serif;
	}

	.auth-input::placeholder {
		color: #a8a29e;
	}

	.auth-input-toggle {
		color: #a8a29e;
		cursor: pointer;
		display: flex;
		background: none;
		border: none;
		padding: 0;
	}

	.auth-submit {
		width: 100%;
		padding: 13px 0;
		background: linear-gradient(135deg, #16a34a, #15803d);
		border: none;
		border-radius: 10px;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'DM Sans', system-ui, sans-serif;
		box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.auth-submit:hover {
		transform: translateY(-1px);
		filter: brightness(1.08);
	}

	.auth-submit:active {
		transform: translateY(0);
		filter: brightness(0.97);
	}

	.auth-submit-arrow {
		display: flex;
		transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.auth-submit:hover .auth-submit-arrow {
		transform: translateX(4px);
	}

	.auth-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		filter: none;
	}

	.auth-spinner {
		display: flex;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
