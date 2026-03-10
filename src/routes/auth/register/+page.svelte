<script lang="ts">
	import { signUp } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { User, AtSign, Mail, Lock, Eye, EyeOff, ArrowRight, CircleCheck, CircleX, Loader2 } from 'lucide-svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { toast } from 'svelte-sonner';

	let name = $state('');
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let termsAccepted = $state(false);
	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let nameFocused = $state(false);
	let usernameFocused = $state(false);
	let emailFocused = $state(false);
	let passwordFocused = $state(false);
	let confirmFocused = $state(false);

	let usernameAvailable = $state<boolean | null>(null);
	let usernameChecking = $state(false);
	let usernameCheckTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		const val = username.trim();
		usernameAvailable = null;
		clearTimeout(usernameCheckTimeout);
		if (val.length < 3) return;
		if (!/^[a-zA-Z0-9_]+$/.test(val)) return;
		usernameChecking = true;
		usernameCheckTimeout = setTimeout(async () => {
			try {
				const res = await fetch(`/api/username/check?username=${encodeURIComponent(val)}`);
				const data = await res.json();
				if (username.trim() === val) {
					usernameAvailable = data.available;
				}
			} catch {}
			usernameChecking = false;
		}, 400);
	});

	const passwordChecks = $derived([
		{ label: 'At least 8 characters', met: password.length >= 8 },
		{ label: 'Contains a number', met: /\d/.test(password) },
		{ label: 'Contains uppercase letter', met: /[A-Z]/.test(password) }
	]);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}
		if (!termsAccepted) {
			toast.error('You must agree to the Terms of Service and Privacy Policy.');
			return;
		}
		loading = true;

		const { error: err } = await signUp.email({ name, username, email, password });
		if (err) {
			toast.error(err.message ?? 'Registration failed. Please try again.');
			loading = false;
		} else {
			goto('/', { invalidateAll: true });
		}
	}
</script>

<svelte:head>
	<title>Sign Up — Treetag</title>
</svelte:head>

<h1 class="auth-heading">Create your account</h1>
<p class="auth-subtitle">Start your journey as a Tree Guardian today.</p>

<form onsubmit={handleSubmit}>
	<!-- Full Name -->
	<div class="mb-4">
		<label for="name" class="auth-label">Full Name</label>
		<div class="auth-input-wrap" class:focused={nameFocused}>
			<div class="auth-input-icon" class:active={nameFocused}><User size={16} /></div>
			<input
				id="name"
				type="text"
				autocomplete="name"
				required
				placeholder="Your name"
				bind:value={name}
				onfocus={() => (nameFocused = true)}
				onblur={() => (nameFocused = false)}
				class="auth-input"
			/>
		</div>
	</div>

	<!-- Username -->
	<div class="mb-4">
		<label for="username" class="auth-label">Username</label>
		<div class="auth-input-wrap" class:focused={usernameFocused}>
			<div class="auth-input-icon" class:active={usernameFocused}><AtSign size={16} /></div>
			<input
				id="username"
				type="text"
				autocomplete="username"
				required
				minlength={3}
				placeholder="username"
				bind:value={username}
				onfocus={() => (usernameFocused = true)}
				onblur={() => (usernameFocused = false)}
				class="auth-input"
			/>
			{#if usernameChecking}
				<span class="auth-input-icon"><Loader2 size={14} class="animate-spin" /></span>
			{:else if usernameAvailable === true}
				<span class="text-green-600 flex"><CircleCheck size={14} /></span>
			{:else if usernameAvailable === false}
				<span class="text-red-500 flex"><CircleX size={14} /></span>
			{/if}
		</div>
		{#if usernameAvailable === false}
			<p class="mt-1 text-[12px] text-red-500">This username is already taken.</p>
		{:else if usernameAvailable === true}
			<p class="mt-1 text-[12px] text-green-600">Username is available!</p>
		{/if}
	</div>

	<!-- Email -->
	<div class="mb-4">
		<label for="email" class="auth-label">Email Address</label>
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

	<!-- Password -->
	<div class="mb-4">
		<label for="password" class="auth-label">Password</label>
		<div class="auth-input-wrap" class:focused={passwordFocused}>
			<div class="auth-input-icon" class:active={passwordFocused}><Lock size={16} /></div>
			<input
				id="password"
				type={showPassword ? 'text' : 'password'}
				autocomplete="new-password"
				required
				minlength={8}
				placeholder="Create a password"
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

	<!-- Confirm Password -->
	<div class="mb-4">
		<label for="confirmPassword" class="auth-label">Confirm Password</label>
		<div class="auth-input-wrap" class:focused={confirmFocused}>
			<div class="auth-input-icon" class:active={confirmFocused}><Lock size={16} /></div>
			<input
				id="confirmPassword"
				type={showConfirmPassword ? 'text' : 'password'}
				autocomplete="new-password"
				required
				minlength={8}
				placeholder="Confirm your password"
				bind:value={confirmPassword}
				onfocus={() => (confirmFocused = true)}
				onblur={() => (confirmFocused = false)}
				class="auth-input"
			/>
			<button type="button" class="auth-input-toggle" onclick={() => (showConfirmPassword = !showConfirmPassword)}>
				{#if showConfirmPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
			</button>
		</div>
	</div>

	<!-- Terms -->
	<div class="mb-5 mt-1">
		<Checkbox bind:checked={termsAccepted}>
			I agree to the <a href="/legal/tos" class="text-green-600 font-semibold hover:underline">Terms of Service</a> and <a href="/legal/privacy" class="text-green-600 font-semibold hover:underline">Privacy Policy</a>
		</Checkbox>
	</div>

	<!-- Submit -->
	<button type="submit" disabled={loading} class="auth-submit">
		{loading ? 'Creating account' : 'Create Account'}
		<span class="auth-submit-arrow">
			{#if loading}<span class="auth-spinner"><Loader2 size={16} /></span>{:else}<ArrowRight size={16} />{/if}
		</span>
	</button>

	<!-- Password strength -->
	{#if password.length > 0}
		<div class="mt-4 p-3.5 bg-stone-50 border border-stone-100 rounded-[10px]">
			<div class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Password Strength</div>
			<div class="flex flex-col gap-1">
				{#each passwordChecks as check}
					<div class="flex items-center gap-1.5 text-xs transition-colors" class:text-green-600={check.met} class:text-stone-400={!check.met}>
						<CircleCheck size={13} strokeWidth={check.met ? 2.5 : 1.5} />
						{check.label}
					</div>
				{/each}
			</div>
		</div>
	{/if}
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
