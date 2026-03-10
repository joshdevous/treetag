<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {
		User,
		Lock,
		Eye,
		EyeOff,
		Shield,
		AtSign,
		Camera,
		Image,
		Save,
		Trash2,
		LoaderCircle,
		CircleCheck,
		CircleX
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	let { form } = $props();

	const user = $derived($page.data.user);

	let activeTab = $state<string>((form?.tab as string) ?? 'profile');
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let avatarPreview = $state<string | null>(null);
	let bannerPreview = $state<string | null>(null);
	let changingPassword = $state(false);
	let uploading = $state(false);
	let removeAvatar = $state(false);
	let removeBanner = $state(false);

	let bannerInput = $state<HTMLInputElement | null>(null);
	let avatarInput = $state<HTMLInputElement | null>(null);

	let confirmRemoveType = $state<'avatar' | 'banner' | null>(null);
	let confirmRemoveOpen = $state(false);

	let profileName = $state(user?.name ?? '');
	let profileUsername = $state(user?.username ?? '');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let usernameAvailable = $state<boolean | null>(null);
	let usernameChecking = $state(false);
	let usernameCheckTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		const val = profileUsername.trim();
		usernameAvailable = null;
		clearTimeout(usernameCheckTimeout);
		if (val.length < 3 || val === (user?.username ?? '')) return;
		if (!/^[a-zA-Z0-9_]+$/.test(val)) return;
		usernameChecking = true;
		usernameCheckTimeout = setTimeout(async () => {
			try {
				const res = await fetch(`/api/username/check?username=${encodeURIComponent(val)}&excludeUserId=${encodeURIComponent(user?.id ?? '')}`);
				const data = await res.json();
				if (profileUsername.trim() === val) {
					usernameAvailable = data.available;
				}
			} catch {}
			usernameChecking = false;
		}, 400);
	});

	const profileDirty = $derived(
		profileName !== (user?.name ?? '') ||
		profileUsername !== (user?.username ?? '') ||
		!!avatarPreview ||
		!!bannerPreview ||
		removeAvatar ||
		removeBanner
	);

	const securityDirty = $derived(
		currentPassword.length > 0 ||
		newPassword.length > 0 ||
		confirmPassword.length > 0
	);

	function cancelProfileChanges() {
		profileName = user?.name ?? '';
		profileUsername = user?.username ?? '';
		avatarPreview = null;
		bannerPreview = null;
		removeAvatar = false;
		removeBanner = false;
		if (avatarInput) avatarInput.value = '';
		if (bannerInput) bannerInput.value = '';
	}

	function cancelSecurityChanges() {
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}

	function requestRemoveImage(type: 'avatar' | 'banner') {
		confirmRemoveType = type;
		confirmRemoveOpen = true;
	}

	function confirmRemoveImage() {
		if (confirmRemoveType === 'avatar') {
			removeAvatar = true;
			avatarPreview = null;
			if (avatarInput) avatarInput.value = '';
		} else if (confirmRemoveType === 'banner') {
			removeBanner = true;
			bannerPreview = null;
			if (bannerInput) bannerInput.value = '';
		}
		confirmRemoveOpen = false;
		confirmRemoveType = null;
	}

	function handleAvatarSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			avatarPreview = URL.createObjectURL(file);
			removeAvatar = false;
		}
	}

	function handleBannerSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			bannerPreview = URL.createObjectURL(file);
			removeBanner = false;
		}
	}

	function getInitials(name: string) {
		return name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '?';
	}

	const hasAvatar = $derived(avatarPreview || ((user as any)?.avatar && !removeAvatar));
	const hasBanner = $derived(bannerPreview || ((user as any)?.banner && !removeBanner));

	$effect(() => {
		if (form?.tab) activeTab = form.tab as string;
	});

	$effect(() => {
		if (form?.success) toast.success(form.success as string);
		if (form?.error) toast.error(form.error as string);
	});
</script>

<svelte:head>
	<title>Settings — Treetag</title>
</svelte:head>

<!-- Remove image confirmation modal -->
<AlertDialog.Root bind:open={confirmRemoveOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Remove {confirmRemoveType === 'avatar' ? 'profile picture' : 'banner'}?</AlertDialog.Title>
			<AlertDialog.Description>
				This will remove your {confirmRemoveType === 'avatar' ? 'profile picture' : 'banner'} when you save changes. You can upload a new one at any time.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmRemoveImage} class="bg-red-600 text-white hover:bg-red-700">Remove</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<div class="mx-auto max-w-7xl px-6 py-10">
	<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
		Settings
	</h1>
	<p class="mt-1 text-[14px] text-stone-400">Manage your account preferences.</p>

	<Tabs.Root bind:value={activeTab} class="mt-6">
		<Tabs.List class="bg-transparent w-full justify-start gap-1 rounded-none border-b border-stone-200 p-0 h-auto">
			<Tabs.Trigger value="profile" class="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-0 text-[13px] font-medium text-stone-400 hover:text-stone-600 data-[state=active]:border-b-green-600 data-[state=active]:text-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
				<User size={14} /> Profile
			</Tabs.Trigger>
			<Tabs.Trigger value="security" class="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-0 text-[13px] font-medium text-stone-400 hover:text-stone-600 data-[state=active]:border-b-green-600 data-[state=active]:text-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
				<Shield size={14} /> Security
			</Tabs.Trigger>
		</Tabs.List>

		<!-- Profile tab -->
		<Tabs.Content value="profile">
		{#if user}
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
					removeAvatar = false;
					removeBanner = false;
					await update();
					profileName = user?.name ?? '';
					profileUsername = user?.username ?? '';
				};
			}}
			class="mt-6 space-y-5"
		>
			<!-- Banner -->
			<div>
				<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Banner</Label>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="relative block w-full cursor-pointer overflow-hidden rounded-xl border border-stone-200 h-40 transition-all hover:border-green-400 hover:ring-2 hover:ring-green-100 group">
						{#if bannerPreview}
							<img src={bannerPreview} alt="Banner preview" class="h-full w-full object-cover" />
						{:else if (user as any).banner && !removeBanner}
							<img src={(user as any).banner} alt="Current banner" class="h-full w-full object-cover" />
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-600/90 via-emerald-500/80 to-teal-400/70">
								<Image size={32} class="text-white/40" />
							</div>
						{/if}
						<div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
							<div class="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[12px] font-medium text-stone-600 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
								<Camera size={13} /> {hasBanner ? 'Change banner' : 'Upload banner'}
							</div>
						</div>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="center" class="w-44">
						<DropdownMenu.Item onclick={() => bannerInput?.click()} class="gap-2 text-[12px]">
							<Image size={12} /> {hasBanner ? 'Upload new' : 'Upload banner'}
						</DropdownMenu.Item>
						{#if hasBanner}
							<DropdownMenu.Item variant="destructive" onclick={() => requestRemoveImage('banner')} class="gap-2 text-[12px]">
								<Trash2 size={12} /> Remove
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<input type="file" name="banner" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" bind:this={bannerInput} onchange={handleBannerSelect} />
				<p class="mt-1.5 text-[12px] text-stone-400">JPG, PNG, WebP or GIF. Max 10 MB.</p>
			</div>

			<!-- Profile Picture -->
			<div>
				<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Profile Picture</Label>
				<div class="flex items-center gap-4">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="relative cursor-pointer rounded-full transition-all hover:ring-2 hover:ring-green-400 hover:ring-offset-2 group">
							{#if avatarPreview}
								<img src={avatarPreview} alt="Avatar preview" class="h-20 w-20 rounded-full border-2 border-stone-200 object-cover" />
							{:else if (user as any).avatar && !removeAvatar}
								<img src={(user as any).avatar} alt="Current avatar" class="h-20 w-20 rounded-full border-2 border-stone-200 object-cover" />
							{:else}
								<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-2xl font-bold text-white">
									{getInitials(user.name)}
								</div>
							{/if}
							<div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/30">
								<Camera size={16} class="text-white opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-44">
							<DropdownMenu.Item onclick={() => avatarInput?.click()} class="gap-2 text-[12px]">
								<Camera size={12} /> {hasAvatar ? 'Upload new' : 'Upload picture'}
							</DropdownMenu.Item>
							{#if hasAvatar}
								<DropdownMenu.Item variant="destructive" onclick={() => requestRemoveImage('avatar')} class="gap-2 text-[12px]">
									<Trash2 size={12} /> Remove
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<div class="text-[12px] text-stone-400">
						<p>JPG, PNG, WebP or GIF.</p>
						<p>Max 10 MB.</p>
					</div>
				</div>
				<input type="file" name="avatar" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" bind:this={avatarInput} onchange={handleAvatarSelect} />
			</div>

			<Separator class="bg-stone-100" />

			<div>
				<Label for="name" class="mb-1.5 text-[13px] font-medium text-stone-600">Display Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					required
					maxlength={50}
					bind:value={profileName}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
			</div>

			<div>
				<Label for="username" class="mb-1.5 text-[13px] font-medium text-stone-600">Username</Label>
				<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
					<span class="pl-3.5 text-stone-400"><AtSign size={15} /></span>
					<input
						id="username"
						name="username"
						type="text"
						required
						minlength={3}
						maxlength={20}
						bind:value={profileUsername}
						class="w-full rounded-r-[10px] bg-transparent px-1.5 py-2.5 text-[14px] text-stone-800 outline-none"
					/>
				{#if usernameChecking}
					<span class="pr-3 text-stone-400 flex"><LoaderCircle size={14} class="animate-spin" /></span>
				{:else if usernameAvailable === true}
					<span class="pr-3 text-green-600 flex"><CircleCheck size={14} /></span>
				{:else if usernameAvailable === false}
					<span class="pr-3 text-red-500 flex"><CircleX size={14} /></span>
				{/if}
				</div>
				{#if usernameAvailable === false}
					<p class="mt-1 text-[12px] text-red-500">This username is already taken.</p>
				{:else if usernameAvailable === true}
					<p class="mt-1 text-[12px] text-green-600">Username is available!</p>
				{/if}
			</div>

			{#if removeAvatar}<input type="hidden" name="removeAvatar" value="true" />{/if}
			{#if removeBanner}<input type="hidden" name="removeBanner" value="true" />{/if}

			<div class="flex justify-end gap-3">
				<button type="button" onclick={cancelProfileChanges} class="settings-cancel" style:visibility={profileDirty ? 'visible' : 'hidden'}>
					Cancel
				</button>
				<button type="submit" disabled={!profileDirty || uploading} class="settings-submit">
					{#if uploading}
						<span class="settings-spinner"><LoaderCircle size={14} /></span>
					{:else}
						<Save size={14} />
					{/if}
					{uploading ? 'Saving' : 'Save Changes'}
				</button>
			</div>
		</form>
		{/if}
		</Tabs.Content>

		<!-- Security tab -->
		<Tabs.Content value="security">
			{#if user}
			<div class="mt-6 space-y-5">
				<div>
					<Label for="email" class="mb-1.5 text-[13px] font-medium text-stone-600">Email</Label>
					<Input
						id="email"
						type="email"
						disabled
						value={user.email}
						class="h-auto rounded-[10px] border-stone-100 bg-stone-50 px-3.5 py-2.5 text-[14px] text-stone-400"
					/>
					<p class="mt-1 text-[12px] text-stone-400">Email cannot be changed here.</p>
				</div>
			</div>

			<Separator class="my-6 bg-stone-100" />
			{/if}

			<form method="POST" action="?/changePassword" use:enhance={() => {
				changingPassword = true;
				return async ({ update }) => {
					changingPassword = false;
					await update();
					currentPassword = '';
					newPassword = '';
					confirmPassword = '';
				};
			}} class="space-y-5">
				<div>
					<Label for="currentPassword" class="mb-1.5 text-[13px] font-medium text-stone-600">Current Password</Label>
					<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
						<input
							id="currentPassword"
							name="currentPassword"
							type={showCurrentPassword ? 'text' : 'password'}
							required						bind:value={currentPassword}							class="w-full rounded-l-[10px] bg-transparent px-3.5 py-2.5 text-[14px] text-stone-800 outline-none"
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
					<Label for="newPassword" class="mb-1.5 text-[13px] font-medium text-stone-600">New Password</Label>
					<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
						<input
							id="newPassword"
							name="newPassword"
							type={showNewPassword ? 'text' : 'password'}
							required
							minlength={8}						bind:value={newPassword}							class="w-full rounded-l-[10px] bg-transparent px-3.5 py-2.5 text-[14px] text-stone-800 outline-none"
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
					<Label for="confirmPassword" class="mb-1.5 text-[13px] font-medium text-stone-600">Confirm New Password</Label>
					<div class="flex items-center rounded-[10px] border border-stone-200 bg-white transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100">
						<input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							required
							minlength={8}						bind:value={confirmPassword}							class="w-full rounded-l-[10px] bg-transparent px-3.5 py-2.5 text-[14px] text-stone-800 outline-none"
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

				<div class="flex justify-end gap-3">
					<button type="button" onclick={cancelSecurityChanges} class="settings-cancel" style:visibility={securityDirty ? 'visible' : 'hidden'}>
						Cancel
					</button>
					<button type="submit" disabled={!securityDirty || changingPassword} class="settings-submit">
						{#if changingPassword}
							<span class="settings-spinner"><LoaderCircle size={14} /></span>
						{:else}
							<Lock size={14} />
						{/if}
						{changingPassword ? 'Changing' : 'Change Password'}
					</button>
				</div>
			</form>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.settings-submit {
		padding: 11px 24px;
		min-width: 170px;
		background: linear-gradient(135deg, #16a34a, #15803d);
		border: none;
		border-radius: 10px;
		color: #fff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'DM Sans', system-ui, sans-serif;
		box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: filter 0.2s;
	}

	.settings-cancel {
		padding: 11px 24px;
		background: transparent;
		border: 1px solid #d6d3d1;
		border-radius: 10px;
		color: #57534e;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		font-family: 'DM Sans', system-ui, sans-serif;
		transition: background-color 0.2s, border-color 0.2s;
	}

	.settings-cancel:hover {
		background-color: #f5f5f4;
		border-color: #a8a29e;
	}

	.settings-submit:hover {
		filter: brightness(1.08);
	}

	.settings-submit:active {
		filter: brightness(0.97);
	}

	.settings-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		filter: none;
	}

	.settings-spinner {
		display: flex;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
