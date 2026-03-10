<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let success = $state(false);
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let passwordFocused = $state(false);
	let confirmFocused = $state(false);

	const token = $derived($page.url.searchParams.get('token') ?? '');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}

		if (password.length < 8) {
			toast.error('Password must be at least 8 characters.');
			return;
		}

		loading = true;

		const { error } = await authClient.resetPassword({
			newPassword: password,
			token
		});

		if (error) {
			toast.error(error.message ?? 'Failed to reset password. The link may have expired.');
		} else {
			success = true;
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Reset Password — Treetag</title>
</svelte:head>

{#if !token}
	<div class="text-center">
		<h1 class="auth-heading">Invalid link</h1>
		<p class="auth-subtitle">This password reset link is invalid or has expired.</p>
		<a href="/auth/forgot-password" class="text-sm font-medium text-green-600 hover:underline">
			Request a new link
		</a>
	</div>
{:else if success}
	<div class="text-center">
		<div class="flex justify-center mb-4">
			<div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
				<CheckCircle size={24} class="text-green-600" />
			</div>
		</div>
		<h1 class="auth-heading">Password reset!</h1>
		<p class="auth-subtitle">Your password has been changed successfully. You can now log in.</p>
		<a href="/auth/login" class="text-sm font-medium text-green-600 hover:underline">
			Go to login
		</a>
	</div>
{:else}
	<h1 class="auth-heading">Reset your password</h1>
	<p class="auth-subtitle">Choose a new password for your account.</p>

	<form onsubmit={handleSubmit}>
		<!-- New password -->
		<div class="mb-4">
			<label for="password" class="auth-label">New password</label>
			<div class="auth-input-wrap" class:focused={passwordFocused}>
				<div class="auth-input-icon" class:active={passwordFocused}><Lock size={16} /></div>
				<input
					id="password"
					type={showPassword ? 'text' : 'password'}
					autocomplete="new-password"
					required
					minlength={8}
					placeholder="At least 8 characters"
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

		<!-- Confirm password -->
		<div class="mb-6">
			<label for="confirm-password" class="auth-label">Confirm password</label>
			<div class="auth-input-wrap" class:focused={confirmFocused}>
				<div class="auth-input-icon" class:active={confirmFocused}><Lock size={16} /></div>
				<input
					id="confirm-password"
					type={showConfirm ? 'text' : 'password'}
					autocomplete="new-password"
					required
					minlength={8}
					placeholder="Repeat your password"
					bind:value={confirmPassword}
					onfocus={() => (confirmFocused = true)}
					onblur={() => (confirmFocused = false)}
					class="auth-input"
				/>
				<button type="button" class="auth-input-toggle" onclick={() => (showConfirm = !showConfirm)}>
					{#if showConfirm}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
				</button>
			</div>
		</div>

		<button type="submit" disabled={loading} class="auth-submit">
			{loading ? 'Resetting' : 'Reset password'}
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
