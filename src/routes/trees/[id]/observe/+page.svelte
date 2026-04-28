<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Tag,
		HeartHandshake,
		Leaf,
		AlertTriangle,
		Camera,
		FileText,
		ArrowLeft,
		LoaderCircle,
		Plus,
		X,
		Award
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';

	let { data, form } = $props();
	const tree = $derived(data.tree);

	const TYPES = [
		{ value: 'tag', label: 'I found this tree', icon: Tag, points: 5, hint: 'A quick visit log — no extra info needed.' },
		{ value: 'health_check', label: 'Health check', icon: HeartHandshake, points: 20, hint: 'Report on the tree’s overall condition.' },
		{ value: 'wildlife', label: 'Wildlife sighting', icon: Leaf, points: 15, hint: 'Spotted a bird, insect or mammal in or around the tree.' },
		{ value: 'disease', label: 'Disease / damage', icon: AlertTriangle, points: 25, hint: 'Sign of disease, pests, or storm damage.' },
		{ value: 'photo', label: 'Photo update', icon: Camera, points: 10, hint: 'Share a current photo of the tree.' },
		{ value: 'note', label: 'Note', icon: FileText, points: 5, hint: 'Add a free-form observation.' }
	] as const;

	let type = $state<(typeof TYPES)[number]['value']>('tag');
	let content = $state('');
	let healthStatus = $state('healthy');
	let wildlifeSpecies = $state('');
	let wildlifeCategory = $state('bird');
	let photoPreviews = $state<string[]>([]);
	let photoInput = $state<HTMLInputElement | null>(null);
	let submitting = $state(false);

	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
	const MAX_PHOTOS = 5;

	const selectedType = $derived(TYPES.find((t) => t.value === type) ?? TYPES[0]);

	function handlePhotoSelect(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (!files) return;
		for (const file of files) {
			if (!ALLOWED_TYPES.includes(file.type)) {
				toast.error(`${file.name}: only JPG, PNG, WebP and GIF are allowed.`);
				continue;
			}
			if (file.size > MAX_PHOTO_SIZE) {
				toast.error(`${file.name} exceeds the 10 MB size limit.`);
				continue;
			}
			if (photoPreviews.length >= MAX_PHOTOS) {
				toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
				break;
			}
			photoPreviews.push(URL.createObjectURL(file));
		}
	}

	function removePhoto(index: number) {
		photoPreviews.splice(index, 1);
		if (photoInput) {
			const dt = new DataTransfer();
			const files = photoInput.files;
			if (files) {
				for (let i = 0; i < files.length; i++) {
					if (i !== index) dt.items.add(files[i]);
				}
			}
			photoInput.files = dt.files;
		}
	}

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});

	function fieldError(field: string): string | null {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const f = form as any;
		return f?.field === field ? f.error : null;
	}
</script>

<svelte:head>
	<title>Observe {tree.name} — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-10">
	<a href="/trees/{tree.id}" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to {tree.name}
	</a>

	<div class="mb-8">
		<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
			Tag this tree
		</h1>
		<p class="mt-1 text-[14px] text-stone-400">
			Record your visit to <span class="font-medium text-stone-600">{tree.name}</span>
			<span class="text-stone-400"> ({tree.species})</span>.
		</p>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
		class="space-y-8"
	>
		<input type="hidden" name="type" value={type} />

		<!-- Observation type picker -->
		<section class="space-y-3">
			<Label class="text-[13px] font-semibold uppercase tracking-wider text-stone-500">
				What did you observe?
			</Label>
			<div class="grid gap-2 sm:grid-cols-2">
				{#each TYPES as option}
					{@const Icon = option.icon}
					<button
						type="button"
						onclick={() => (type = option.value)}
						class="group flex items-start gap-3 rounded-xl border p-3 text-left transition-all {type === option.value ? 'border-green-400 bg-green-50/60 ring-2 ring-green-100' : 'border-stone-200 bg-white hover:border-stone-300'}"
					>
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full {type === option.value ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}">
							<Icon size={16} />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between gap-2">
								<p class="text-[13px] font-semibold text-stone-800">{option.label}</p>
								<span class="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-600">
									<Award size={11} />
									+{option.points}
								</span>
							</div>
							<p class="mt-0.5 text-[12px] text-stone-500">{option.hint}</p>
						</div>
					</button>
				{/each}
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Type-specific fields -->
		{#if type === 'health_check' || type === 'disease'}
			<section class="space-y-3">
				<Label for="healthStatus" class="text-[13px] font-medium text-stone-600">Health status</Label>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{#each ['healthy', 'concern', 'diseased', 'dead'] as status}
						<button
							type="button"
							onclick={() => (healthStatus = status)}
							class="rounded-[10px] border px-3 py-2 text-[12px] font-medium capitalize transition-all {healthStatus === status ? 'border-green-400 bg-green-50 text-green-700 ring-2 ring-green-100' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}"
						>
							{status}
						</button>
					{/each}
				</div>
				<input type="hidden" name="healthStatus" value={healthStatus} />
				{#if fieldError('healthStatus')}
					<p class="text-[12px] text-red-500">{fieldError('healthStatus')}</p>
				{/if}
			</section>
		{/if}

		{#if type === 'wildlife'}
			<section class="space-y-4">
				<div>
					<Label for="wildlifeSpecies" class="mb-1.5 text-[13px] font-medium text-stone-600">Species *</Label>
					<Input
						id="wildlifeSpecies"
						name="wildlifeSpecies"
						type="text"
						required
						maxlength={100}
						placeholder="e.g. Blue tit, Stag beetle, Grey squirrel"
						bind:value={wildlifeSpecies}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('wildlifeSpecies') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
					/>
					{#if fieldError('wildlifeSpecies')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('wildlifeSpecies')}</p>
					{/if}
				</div>
				<div>
					<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Category</Label>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{#each ['bird', 'insect', 'mammal', 'other'] as category}
							<button
								type="button"
								onclick={() => (wildlifeCategory = category)}
								class="rounded-[10px] border px-3 py-2 text-[12px] font-medium capitalize transition-all {wildlifeCategory === category ? 'border-green-400 bg-green-50 text-green-700 ring-2 ring-green-100' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}"
							>
								{category}
							</button>
						{/each}
					</div>
					<input type="hidden" name="wildlifeCategory" value={wildlifeCategory} />
					{#if fieldError('wildlifeCategory')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('wildlifeCategory')}</p>
					{/if}
				</div>
			</section>
		{/if}

		<!-- Notes -->
		<section>
			<Label for="content" class="mb-1.5 text-[13px] font-medium text-stone-600">
				{type === 'note' ? 'Note *' : 'Note (optional)'}
			</Label>
			<textarea
				id="content"
				name="content"
				rows={4}
				maxlength={2000}
				placeholder={type === 'tag' ? 'Anything noteworthy about your visit?' : 'Add any details…'}
				bind:value={content}
				class="w-full resize-none rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100 {fieldError('content') ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}"
			></textarea>
			<div class="mt-1 flex justify-between">
				{#if fieldError('content')}
					<p class="text-[12px] text-red-500">{fieldError('content')}</p>
				{:else}
					<span></span>
				{/if}
				<p class="text-[12px] text-stone-400 {content.length > 1900 ? 'text-amber-500' : ''} {content.length >= 2000 ? 'font-medium text-red-500' : ''}">{content.length}/2,000</p>
			</div>
		</section>

		<!-- Photos -->
		<section>
			<Label class="mb-1.5 text-[13px] font-medium text-stone-600">
				{type === 'photo' ? 'Photos *' : 'Photos (optional)'}
			</Label>
			<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
				{#each photoPreviews as preview, i}
					<div class="group relative aspect-square overflow-hidden rounded-xl border border-stone-200">
						<img src={preview} alt="Photo {i + 1}" class="h-full w-full object-cover" />
						<Button
							type="button"
							variant="ghost"
							onclick={() => removePhoto(i)}
							class="absolute right-1.5 top-1.5 h-auto rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
						>
							<X size={12} />
						</Button>
					</div>
				{/each}
				{#if photoPreviews.length < MAX_PHOTOS}
					<Button
						type="button"
						variant="outline"
						onclick={() => photoInput?.click()}
						class="flex h-auto aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-stone-200 text-stone-400 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-600"
					>
						<div class="flex flex-col items-center gap-1">
							<Plus size={20} />
							<span class="text-[11px] font-medium">Add Photo</span>
						</div>
					</Button>
				{/if}
			</div>
			<input
				type="file"
				name="photos"
				accept="image/jpeg,image/png,image/webp,image/gif"
				multiple
				class="hidden"
				bind:this={photoInput}
				onchange={handlePhotoSelect}
			/>
			<p class="mt-2 text-[12px] text-stone-400">JPG, PNG, WebP or GIF. Max 10 MB each, up to {MAX_PHOTOS} photos.</p>
			{#if fieldError('photos')}
				<p class="mt-1 text-[12px] text-red-500">{fieldError('photos')}</p>
			{/if}
		</section>

		<!-- Reward summary -->
		<div class="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
			<div class="flex items-center gap-2">
				<Award size={16} class="text-amber-600" />
				<p class="text-[13px] font-medium text-amber-800">You'll earn <span class="font-bold">+{selectedType.points} points</span></p>
			</div>
			<p class="text-[11px] text-amber-700">{selectedType.label}</p>
		</div>

		<div class="flex justify-end gap-3 pb-8">
			<Button
				variant="outline"
				href="/trees/{tree.id}"
				class="rounded-[10px] border-stone-200 px-5 py-2.5 text-[13px] font-medium text-stone-500"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				variant="default"
				disabled={submitting}
				class="inline-flex items-center gap-2 rounded-[10px] bg-linear-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if submitting}
					<LoaderCircle size={14} class="animate-spin" />
					Saving…
				{:else}
					<Tag size={14} />
					Submit Observation
				{/if}
			</Button>
		</div>
	</form>
</div>
