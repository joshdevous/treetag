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
		AlertCircle,
		Camera,
		Image,
		Save,
		Trash2
	} from 'lucide-svelte';

	let { form } = $props();

	const user = $derived($page.data.user);

	let activeTab = $state<'profile' | 'security'>((form?.tab as 'profile' | 'security') ?? 'profile');
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let avatarPreview = $state<string | null>(null);
	let bannerPreview = $state<string | null>(null);
	let uploading = $state(false);
	let bannerMenuOpen = $state(false);
	let avatarMenuOpen = $state(false);

	let bannerInput = $state<HTMLInputElement | null>(null);
	let avatarInput = $state<HTMLInputElement | null>(null);

	async function removeImage(type: 'avatar' | 'banner') {
		const body = new FormData();
		body.append('type', type);
		const res = await fetch('?/removeImage', { method: 'POST', body });
		if (res.ok) {
			window.location.reload();
		}
	}

	function handleAvatarSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) avatarPreview = URL.createObjectURL(file);
		avatarMenuOpen = false;
	}

	function handleBannerSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) bannerPreview = URL.createObjectURL(file);
		bannerMenuOpen = false;
	}

	function getInitials(name: string) {
		return name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '?';
	}

	$effect(() => {
		if (form?.tab) activeTab = form.tab as 'profile' | 'security';
	});
</script>

<svelte:window onclick={() => { bannerMenuOpen = false; avatarMenuOpen = false; }} />

<svelte:head>
	<title>Settings — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-10">
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
		<form
			method="POST"
			action="?/updateProfile"
			enctype="multipart/form-data"
			use:enhance={() => {
				uploading = true;
				return async ({ update }) => {
					uploading = false;
					avatarPreview = null;
					bannerPreview = null;
					await update();
				};
			}}
			class="mt-6 space-y-5"
		>
			<h3 class="text-[14px] font-semibold text-stone-700">Profile Picture & Banner</h3>

			<!-- Banner preview + upload -->
			<div>
				<label class="mb-1.5 block text-[13px] font-medium text-stone-600">Banner</label>
				<div class="relative overflow-hidden rounded-xl border border-stone-200 h-40">
					{#if bannerPreview}
						<img src={bannerPreview} alt="Banner preview" class="h-full w-full object-cover" />
					{:else if (user as any).banner}
						<img src={(user as any).banner} alt="Current banner" class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-600/90 via-emerald-500/80 to-teal-400/70">
							<Image size={32} class="text-white/40" />
						</div>
					{/if}
					<input type="file" name="banner" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" bind:this={bannerInput} onchange={handleBannerSelect} />
					<div class="absolute bottom-2 right-2">
						{#if (user as any).banner}
							<button
								type="button"
							onclick={(e) => { e.stopPropagation(); bannerMenuOpen = !bannerMenuOpen; }}
								class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[12px] font-medium text-stone-600 shadow-sm backdrop-blur-sm hover:bg-white"
							>
								<Image size={13} /> Change banner
							</button>
							{#if bannerMenuOpen}
								<div class="absolute bottom-full right-0 mb-1.5 w-40 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
									<button
										type="button"
										onclick={() => { bannerMenuOpen = false; bannerInput?.click(); }}
										class="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-[12px] text-stone-600 hover:bg-stone-50"
									>
										<Image size={12} /> Upload new
									</button>
									<button
										type="button"
										onclick={() => { bannerMenuOpen = false; removeImage('banner'); }}
										class="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50"
									>
										<Trash2 size={12} /> Remove
									</button>
								</div>
							{/if}
						{:else}
							<label class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[12px] font-medium text-stone-600 shadow-sm backdrop-blur-sm hover:bg-white">
								<Image size={13} /> Upload banner
								<input type="file" name="banner_direct" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" onchange={(e) => { handleBannerSelect(e); if (bannerInput && (e.target as HTMLInputElement).files?.[0]) { const dt = new DataTransfer(); dt.items.add((e.target as HTMLInputElement).files![0]); bannerInput.files = dt.files; } }} />
							</label>
						{/if}
					</div>
				</div>
			</div>

			<!-- Avatar preview + upload -->
			<div>
				<label class="mb-1.5 block text-[13px] font-medium text-stone-600">Profile Picture</label>
				<div class="flex items-center gap-4">
					<div class="relative">
						{#if avatarPreview}
							<img src={avatarPreview} alt="Avatar preview" class="h-20 w-20 rounded-full border-2 border-stone-200 object-cover" />
						{:else if (user as any).avatar}
							<img src={(user as any).avatar} alt="Current avatar" class="h-20 w-20 rounded-full border-2 border-stone-200 object-cover" />
						{:else}
							<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-2xl font-bold text-white">
								{getInitials(user.name)}
							</div>
						{/if}
						<input type="file" name="avatar" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" bind:this={avatarInput} onchange={handleAvatarSelect} />
						{#if (user as any).avatar}
							<button
								type="button"
							onclick={(e) => { e.stopPropagation(); avatarMenuOpen = !avatarMenuOpen; }}
								class="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm border border-stone-200 hover:bg-stone-50"
							>
								<Camera size={13} class="text-stone-500" />
							</button>
							{#if avatarMenuOpen}
								<div class="absolute -bottom-1 left-8 w-40 rounded-lg border border-stone-200 bg-white py-1 shadow-lg z-10">
									<button
										type="button"
										onclick={() => { avatarMenuOpen = false; avatarInput?.click(); }}
										class="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-[12px] text-stone-600 hover:bg-stone-50"
									>
										<Camera size={12} /> Upload new
									</button>
									<button
										type="button"
										onclick={() => { avatarMenuOpen = false; removeImage('avatar'); }}
										class="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50"
									>
										<Trash2 size={12} /> Remove
									</button>
								</div>
							{/if}
						{:else}
							<label class="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm border border-stone-200 hover:bg-stone-50">
								<Camera size={13} class="text-stone-500" />
								<input type="file" name="avatar_direct" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" onchange={(e) => { handleAvatarSelect(e); if (avatarInput && (e.target as HTMLInputElement).files?.[0]) { const dt = new DataTransfer(); dt.items.add((e.target as HTMLInputElement).files![0]); avatarInput.files = dt.files; } }} />
							</label>
						{/if}
					</div>
					<div class="text-[12px] text-stone-400">
						<p>JPG, PNG, WebP or GIF.</p>
						<p>Max 10 MB.</p>
					</div>
				</div>
			</div>

			<hr class="border-stone-100" />

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
				disabled={uploading}
				class="flex cursor-pointer items-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-[13px] font-semibold text-white shadow-lg shadow-green-900/20 transition-all hover:bg-green-800 hover:shadow-xl disabled:opacity-50"
			>
				<Save size={14} />
				{uploading ? 'Saving…' : 'Save Changes'}
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
				class="flex cursor-pointer items-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-[13px] font-semibold text-white shadow-lg shadow-green-900/20 transition-all hover:bg-green-800 hover:shadow-xl"
			>
				<Lock size={14} />
				Change Password
			</button>
		</form>
	{/if}
</div>
