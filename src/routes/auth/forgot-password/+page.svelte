<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let emailFocused = $state(false);
	let cooldown = $state(0);
	let cooldownInterval: ReturnType<typeof setInterval>;

	function startCooldown() {
		cooldown = 60;
		clearInterval(cooldownInterval);
		cooldownInterval = setInterval(() => {
			cooldown--;
			if (cooldown <= 0) clearInterval(cooldownInterval);
		}, 1000);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		const { error } = await authClient.requestPasswordReset({
			email,
			redirectTo: '/auth/reset-password'
		});

		if (error) {
			toast.error(error.message ?? 'Something went wrong. Please try again.');
		} else {
			sent = true;
			startCooldown();
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Forgot Password — Treetag</title>
</svelte:head>

{#if sent}
	<div class="text-center">
		<div class="flex justify-center mb-4">
			<div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
				<CheckCircle size={24} class="text-green-600" />
			</div>
		</div>
		<h1 class="auth-heading">Check your email</h1>
		<p class="auth-subtitle">
			We've sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.
		</p>
		<button
			type="button"
			onclick={() => { sent = false; handleSubmit(new Event('submit')); }}
			disabled={loading || cooldown > 0}
			class="text-sm font-medium text-green-600 hover:underline disabled:opacity-50 disabled:no-underline"
		>
			{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
		</button>
		<div class="mt-2">
			<a href="/auth/login" class="text-sm font-medium text-stone-400 hover:underline">
				Back to login
			</a>
		</div>
	</div>
{:else}
	<h1 class="auth-heading">Forgot your password?</h1>
	<p class="auth-subtitle">Enter your email and we'll send you a link to reset it.</p>

	<form onsubmit={handleSubmit}>
		<div class="mb-6">
			<label for="email" class="auth-label">Email address</label>
			<div class="auth-input-wrap" class:focused={emailFocused}>
				<div class="auth-input-icon" class:active={emailFocused}><Mail size={16} /></div>
				<input
					id="email"
					type="email"
					autocomplete="email"
					required
					placeholder="you@example.com"
					bind:value={email}
					onfocus={() => (emailFocused = true)}
					onblur={() => (emailFocused = false)}
					class="auth-input"
				/>
			</div>
		</div>

		<button type="submit" disabled={loading} class="auth-submit">
			{loading ? 'Sending' : 'Send reset link'}
			<span class="auth-submit-arrow">
				{#if loading}<span class="auth-spinner"><Loader2 size={16} /></span>{:else}<ArrowRight size={16} />{/if}
			</span>
		</button>
	</form>
{/if}

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
