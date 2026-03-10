<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {
		User,
		Lock,
		Eye,
		EyeOff,
		Shield,
		Check,
		AlertCircle
	} from 'lucide-svelte';

	let { form } = $props();

	const user = $derived($page.data.user);

	let activeTab = $state<'profile' | 'security'>((form?.tab as 'profile' | 'security') ?? 'profile');
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	$effect(() => {
		if (form?.tab) activeTab = form.tab as 'profile' | 'security';
	});
</script>

<svelte:head>
	<title>Settings — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-10">
	<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
		Settings
	</h1>
	<p class="mt-1 text-[14px] text-stone-400">Manage your account preferences.</p>

	<!-- Tabs -->
	<div class="mt-6 flex gap-1 border-b border-stone-200">
		<button
			onclick={() => (activeTab = 'profile')}
			class="cursor-pointer border-b-2 px-4 pb-2.5 text-[13px] font-medium transition-colors {activeTab ===
			'profile'
				? 'border-green-600 text-green-600'
				: 'border-transparent text-stone-400 hover:text-stone-600'}"
		>
			<span class="flex items-center gap-1.5"><User size={14} /> Profile</span>
		</button>
		<button
			onclick={() => (activeTab = 'security')}
			class="cursor-pointer border-b-2 px-4 pb-2.5 text-[13px] font-medium transition-colors {activeTab ===
			'security'
				? 'border-green-600 text-green-600'
				: 'border-transparent text-stone-400 hover:text-stone-600'}"
		>
			<span class="flex items-center gap-1.5"><Shield size={14} /> Security</span>
		</button>
	</div>

	<!-- Feedback -->
	{#if form?.success}
		<div class="mt-4 flex items-center gap-2 rounded-[10px] bg-green-50 border border-green-200 px-3.5 py-2.5 text-[13px] text-green-700">
			<Check size={15} /> {form.success}
		</div>
	{/if}
	{#if form?.error}
		<div class="mt-4 flex items-center gap-2 rounded-[10px] bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] text-red-600">
			<AlertCircle size={15} /> {form.error}
		</div>
	{/if}

	<!-- Profile tab -->
	{#if activeTab === 'profile' && user}
		<form method="POST" action="?/updateProfile" use:enhance class="mt-6 space-y-5">
			<div>
				<label for="name" class="mb-1.5 block text-[13px] font-medium text-stone-600">Full Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={user.name}
					class="w-full rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100"
				/>
			</div>

			<div>
				<label for="username" class="mb-1.5 block text-[13px] font-medium text-stone-600">Username</label>
				<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
					<span class="pl-3.5 text-[14px] text-stone-400">@</span>
					<input
						id="username"
						name="username"
						type="text"
						required
						minlength={3}
						value={user.username}
						class="w-full rounded-r-[10px] bg-transparent px-1.5 py-2.5 text-[14px] text-stone-800 outline-none"
					/>
				</div>
			</div>

			<div>
				<label for="email" class="mb-1.5 block text-[13px] font-medium text-stone-600">Email</label>
				<input
					id="email"
					type="email"
					disabled
					value={user.email}
					class="w-full rounded-[10px] border border-stone-100 bg-stone-50 px-3.5 py-2.5 text-[14px] text-stone-400"
				/>
				<p class="mt-1 text-[12px] text-stone-400">Email cannot be changed here.</p>
			</div>

			<button
				type="submit"
				class="cursor-pointer rounded-[10px] bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
			>
				Save Changes
			</button>
		</form>
	{/if}

	<!-- Security tab -->
	{#if activeTab === 'security'}
		<form method="POST" action="?/changePassword" use:enhance class="mt-6 space-y-5">
			<div>
				<label for="currentPassword" class="mb-1.5 block text-[13px] font-medium text-stone-600">Current Password</label>
				<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
					<input
						id="currentPassword"
						name="currentPassword"
						type={showCurrentPassword ? 'text' : 'password'}
						required
						class="w-full rounded-l-[10px] bg-transparent px-3.5 py-2.5 text-[14px] text-stone-800 outline-none"
					/>
					<button
						type="button"
						onclick={() => (showCurrentPassword = !showCurrentPassword)}
						class="cursor-pointer px-3 text-stone-400 hover:text-stone-600"
					>
						{#if showCurrentPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
					</button>
				</div>
			</div>

			<div>
				<label for="newPassword" class="mb-1.5 block text-[13px] font-medium text-stone-600">New Password</label>
				<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
					<input
						id="newPassword"
						name="newPassword"
						type={showNewPassword ? 'text' : 'password'}
						required
						minlength={8}
						class="w-full rounded-l-[10px] bg-transparent px-3.5 py-2.5 text-[14px] text-stone-800 outline-none"
					/>
					<button
						type="button"
						onclick={() => (showNewPassword = !showNewPassword)}
						class="cursor-pointer px-3 text-stone-400 hover:text-stone-600"
					>
						{#if showNewPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
					</button>
				</div>
			</div>

			<div>
				<label for="confirmPassword" class="mb-1.5 block text-[13px] font-medium text-stone-600">Confirm New Password</label>
				<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
					<input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						required
						minlength={8}
						class="w-full rounded-l-[10px] bg-transparent px-3.5 py-2.5 text-[14px] text-stone-800 outline-none"
					/>
					<button
						type="button"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
						class="cursor-pointer px-3 text-stone-400 hover:text-stone-600"
					>
						{#if showConfirmPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
					</button>
				</div>
			</div>

			<button
				type="submit"
				class="cursor-pointer rounded-[10px] bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
			>
				Change Password
			</button>
		</form>
	{/if}
</div>
