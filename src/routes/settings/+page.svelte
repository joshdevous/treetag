<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {
		User,
		Lock,
		Eye,
		EyeOff,
		Shield,
		Camera,
		Image,
		Save,
		Trash2,
		LoaderCircle
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tabs from '$lib/components/ui/tabs';
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

	function removeImage(type: 'avatar' | 'banner') {
		if (type === 'avatar') {
			removeAvatar = true;
			avatarPreview = null;
			if (avatarInput) avatarInput.value = '';
		} else {
			removeBanner = true;
			bannerPreview = null;
			if (bannerInput) bannerInput.value = '';
		}
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
				};
			}}
			class="mt-6 space-y-5"
		>
			<h3 class="text-[14px] font-semibold text-stone-700">Profile Picture & Banner</h3>

			<!-- Banner preview + upload -->
			<div>
				<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Banner</Label>
				<div class="relative overflow-hidden rounded-xl border border-stone-200 h-40">
					{#if bannerPreview}
						<img src={bannerPreview} alt="Banner preview" class="h-full w-full object-cover" />
					{:else if (user as any).banner && !removeBanner}
						<img src={(user as any).banner} alt="Current banner" class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-600/90 via-emerald-500/80 to-teal-400/70">
							<Image size={32} class="text-white/40" />
						</div>
					{/if}
					<input type="file" name="banner" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" bind:this={bannerInput} onchange={handleBannerSelect} />
					<div class="absolute bottom-2 right-2">
						{#if bannerPreview || ((user as any).banner && !removeBanner)}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[12px] font-medium text-stone-600 shadow-sm backdrop-blur-sm hover:bg-white">
									<Image size={13} /> Change banner
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" class="w-40">
									<DropdownMenu.Item onclick={() => bannerInput?.click()} class="gap-2 text-[12px]">
										<Image size={12} /> Upload new
									</DropdownMenu.Item>
									<DropdownMenu.Item variant="destructive" onclick={() => removeImage('banner')} class="gap-2 text-[12px]">
										<Trash2 size={12} /> Remove
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
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
				<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Profile Picture</Label>
				<div class="flex items-center gap-4">
					<div class="relative">
						{#if avatarPreview}
							<img src={avatarPreview} alt="Avatar preview" class="h-20 w-20 rounded-full border-2 border-stone-200 object-cover" />
						{:else if (user as any).avatar && !removeAvatar}
							<img src={(user as any).avatar} alt="Current avatar" class="h-20 w-20 rounded-full border-2 border-stone-200 object-cover" />
						{:else}
							<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-2xl font-bold text-white">
								{getInitials(user.name)}
							</div>
						{/if}
						<input type="file" name="avatar" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" bind:this={avatarInput} onchange={handleAvatarSelect} />
						{#if avatarPreview || ((user as any).avatar && !removeAvatar)}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm border border-stone-200 hover:bg-stone-50">
									<Camera size={13} class="text-stone-500" />
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-40">
									<DropdownMenu.Item onclick={() => avatarInput?.click()} class="gap-2 text-[12px]">
										<Camera size={12} /> Upload new
									</DropdownMenu.Item>
									<DropdownMenu.Item variant="destructive" onclick={() => removeImage('avatar')} class="gap-2 text-[12px]">
										<Trash2 size={12} /> Remove
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
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

			<Separator class="bg-stone-100" />

			<div>
				<Label for="name" class="mb-1.5 text-[13px] font-medium text-stone-600">Full Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					required
					value={user.name}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
			</div>

			<div>
				<Label for="username" class="mb-1.5 text-[13px] font-medium text-stone-600">Username</Label>
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

			{#if removeAvatar}<input type="hidden" name="removeAvatar" value="true" />{/if}
			{#if removeBanner}<input type="hidden" name="removeBanner" value="true" />{/if}

			<div class="flex justify-end">
				<Button
					type="submit"
					disabled={uploading}
					class="rounded-xl bg-green-700 px-7 py-3 text-[13px] font-semibold shadow-lg shadow-green-900/20 hover:bg-green-800 hover:shadow-xl h-auto min-w-[140px]"
				>
					{#if uploading}
						<LoaderCircle size={14} class="animate-spin" />
					{:else}
						<Save size={14} />
					{/if}
					Save Changes
				</Button>
			</div>
		</form>
		{/if}
		</Tabs.Content>

		<!-- Security tab -->
		<Tabs.Content value="security">
			<form method="POST" action="?/changePassword" use:enhance={() => {
				changingPassword = true;
				return async ({ update }) => {
					changingPassword = false;
					await update();
				};
			}} class="mt-6 space-y-5">
				<div>
					<Label for="currentPassword" class="mb-1.5 text-[13px] font-medium text-stone-600">Current Password</Label>
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
					<Label for="newPassword" class="mb-1.5 text-[13px] font-medium text-stone-600">New Password</Label>
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
					<Label for="confirmPassword" class="mb-1.5 text-[13px] font-medium text-stone-600">Confirm New Password</Label>
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

				<div class="flex justify-end">
					<Button
						type="submit"
						disabled={changingPassword}
						class="rounded-xl bg-green-700 px-7 py-3 text-[13px] font-semibold shadow-lg shadow-green-900/20 hover:bg-green-800 hover:shadow-xl h-auto min-w-[170px]"
					>
						{#if changingPassword}
							<LoaderCircle size={14} class="animate-spin" />
						{:else}
							<Lock size={14} />
						{/if}
						Change Password
					</Button>
				</div>
			</form>
		</Tabs.Content>
	</Tabs.Root>
</div>
