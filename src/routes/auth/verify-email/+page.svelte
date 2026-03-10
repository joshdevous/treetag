<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/stores';
	import { Mail, ArrowRight, Loader2, CheckCircle, MailCheck } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let loading = $state(false);
	let resent = $state(false);
	let email = $state('');

	const emailParam = $derived($page.url.searchParams.get('email') ?? '');

	$effect(() => {
		email = emailParam;
	});

	async function handleResend() {
		if (!email) {
			toast.error('Please enter your email address.');
			return;
		}

		loading = true;

		const { error } = await authClient.sendVerificationEmail({
			email,
			callbackURL: '/auth/login'
		});

		if (error) {
			toast.error(error.message ?? 'Failed to send verification email.');
		} else {
			resent = true;
			toast.success('Verification email sent!');
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Verify Email — Treetag</title>
</svelte:head>

<div class="text-center">
	<div class="flex justify-center mb-4">
		<div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
			{#if resent}
				<CheckCircle size={24} class="text-green-600" />
			{:else}
				<MailCheck size={24} class="text-green-600" />
			{/if}
		</div>
	</div>

	<h1 class="auth-heading">Verify your email</h1>
	<p class="auth-subtitle">
		{#if emailParam}
			We've sent a verification link to <strong>{emailParam}</strong>. Check your inbox and click the link to activate your account.
		{:else}
			Enter your email below to receive a new verification link.
		{/if}
	</p>

	{#if !emailParam}
		<div class="mb-6 text-left">
			<label for="email" class="auth-label">Email address</label>
			<div class="auth-input-wrap" class:focused={false}>
				<div class="auth-input-icon"><Mail size={16} /></div>
				<input
					id="email"
					type="email"
					autocomplete="email"
					required
					placeholder="you@example.com"
					bind:value={email}
					class="auth-input"
				/>
			</div>
		</div>
	{/if}

	<button
		type="button"
		onclick={handleResend}
		disabled={loading}
		class="auth-submit"
	>
		{#if resent}
			Resend verification email
		{:else}
			{loading ? 'Sending' : 'Send verification email'}
		{/if}
		<span class="auth-submit-arrow">
			{#if loading}<span class="auth-spinner"><Loader2 size={16} /></span>{:else}<ArrowRight size={16} />{/if}
		</span>
	</button>

	<div class="mt-5">
		<a href="/auth/login" class="text-xs font-medium text-green-600 hover:underline">
			Back to login
		</a>
	</div>
</div>

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
