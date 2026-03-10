<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import {
		TreePine,
		MapPin,
		Ruler,
		Calendar,
		Camera,
		Tag,
		X,
		LoaderCircle,
		Plus,
		Crosshair,
		ArrowLeft
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';

	let { data, form } = $props();

	let submitting = $state(false);
	let photoPreviews = $state<string[]>([]);
	let photoInput = $state<HTMLInputElement | null>(null);

	// Form fields
	let name = $state('');
	let species = $state('');
	let estimatedAge = $state('');
	let height = $state('');
	let trunkDiameter = $state('');
	let plantedDate = $state('');
	let plantedBy = $state('');
	let latitude = $state('');
	let longitude = $state('');
	let address = $state('');
	let description = $state('');
	let tags = $state('');
	let features = $state('');

	let locating = $state(false);

	const isDev = $derived($page.url.hostname === 'localhost');

	function fillMockData() {
		name = 'The Great Beech of Beeches Way';
		species = 'European Beech';
		description = 'A magnificent mature beech tree with a wide spreading canopy that provides excellent shade in summer. The trunk has several initials carved into the bark dating back decades, and the roots form a dramatic buttress pattern at the base.';
		estimatedAge = '120';
		height = '22';
		trunkDiameter = '95';
		plantedDate = '1906-03-15';
		plantedBy = 'Charlton Kings Parish Council';
		latitude = '51.8841';
		longitude = '-2.0498';
		address = 'Beeches Way, Charlton Kings, GL53 8PQ';
		tags = 'heritage, mature, shady, landmark';
		features = 'wide canopy, buttress roots, carved initials, bird nesting site';
	}

	const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
			if (photoPreviews.length >= 10) {
				toast.error('Maximum 10 photos allowed.');
				break;
			}
			photoPreviews.push(URL.createObjectURL(file));
		}
	}

	function removePhoto(index: number) {
		photoPreviews.splice(index, 1);
		// Reset file input — user will need to re-select
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

	function useCurrentLocation() {
		if (!navigator.geolocation) {
			toast.error('Geolocation is not supported by your browser.');
			return;
		}
		locating = true;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude = position.coords.latitude.toFixed(6);
				longitude = position.coords.longitude.toFixed(6);
				locating = false;
				toast.success('Location detected!');
			},
			(err) => {
				locating = false;
				toast.error('Could not get your location. Please enter coordinates manually.');
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const formData: any = $derived(form);

	function fieldError(field: string): string | null {
		return formData?.field === field ? formData.error : null;
	}
</script>

<svelte:head>
	<title>Register a Tree — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-10">
	<a href="/trees" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to trees
	</a>

	<div class="mb-8">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
					Register a Tree
				</h1>
				<p class="mt-1 text-[14px] text-stone-400">
					Add a new tree to the Charlton Kings database.
				</p>
			</div>
			{#if isDev}
				<button
					type="button"
					onclick={fillMockData}
					class="flex-shrink-0 rounded-[10px] border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
				>
					Fill Mock Data
				</button>
			{/if}
		</div>
		{#if !data.isAdmin}
			<div class="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0 text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
				<p class="text-[13px] text-blue-700">Your submission will be reviewed by an admin before it appears publicly on the map. You'll be able to edit your tree while it's pending.</p>
			</div>
		{/if}
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			submitting = true;
			return async ({ update, result }) => {
				submitting = false;
				await update();
			};
		}}
		class="space-y-8"
	>
		<!-- Basic Info -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<TreePine size={14} />
				Tree Information
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="name" class="mb-1.5 text-[13px] font-medium text-stone-600">Tree Name *</Label>
					<Input
						id="name"
						name="name"
						type="text"
						required
						maxlength={100}
						placeholder="e.g. The Old Oak on Cirencester Road"
						bind:value={name}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('name') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
					/>
					{#if fieldError('name')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('name')}</p>
					{/if}
				</div>
				<div>
					<Label for="species" class="mb-1.5 text-[13px] font-medium text-stone-600">Species *</Label>
					<Input
						id="species"
						name="species"
						type="text"
						required
						maxlength={100}
						placeholder="e.g. English Oak"
						bind:value={species}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('species') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
					/>
					{#if fieldError('species')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('species')}</p>
					{/if}
				</div>
			</div>

			<div>
				<Label for="description" class="mb-1.5 text-[13px] font-medium text-stone-600">Description</Label>
				<textarea
					id="description"
					name="description"
					rows={3}
					maxlength={2000}
					placeholder="Tell us about this tree — its history, notable features, or anything interesting..."
					bind:value={description}
					class="w-full rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none {fieldError('description') ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}"
				></textarea>
				<div class="mt-1 flex justify-between">
					{#if fieldError('description')}
						<p class="text-[12px] text-red-500">{fieldError('description')}</p>
					{:else}
						<span></span>
					{/if}
					<p class="text-[12px] text-stone-400 {description.length > 1900 ? 'text-amber-500' : ''} {description.length >= 2000 ? 'text-red-500 font-medium' : ''}">{description.length}/2,000</p>
				</div>
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Measurements -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<Ruler size={14} />
				Measurements & Age
			</div>

			<div class="grid gap-5 sm:grid-cols-3">
				<div>
					<Label for="estimatedAge" class="mb-1.5 text-[13px] font-medium text-stone-600">Estimated Age (years)</Label>
					<Input
						id="estimatedAge"
						name="estimatedAge"
						type="number"
						min={0}
						max={5000}
						placeholder="e.g. 150"
						bind:value={estimatedAge}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="height" class="mb-1.5 text-[13px] font-medium text-stone-600">Height (metres)</Label>
					<Input
						id="height"
						name="height"
						type="number"
						min={0}
						max={200}
						step={0.1}
						placeholder="e.g. 25"
						bind:value={height}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="trunkDiameter" class="mb-1.5 text-[13px] font-medium text-stone-600">Trunk Diameter (cm)</Label>
					<Input
						id="trunkDiameter"
						name="trunkDiameter"
						type="number"
						min={0}
						max={2000}
						step={0.1}
						placeholder="e.g. 100"
						bind:value={trunkDiameter}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="plantedDate" class="mb-1.5 text-[13px] font-medium text-stone-600">Planted Date</Label>
					<Input
						id="plantedDate"
						name="plantedDate"
						type="date"
						bind:value={plantedDate}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="plantedBy" class="mb-1.5 text-[13px] font-medium text-stone-600">Planted By</Label>
					<Input
						id="plantedBy"
						name="plantedBy"
						type="text"
						maxlength={100}
						placeholder="e.g. Charlton Kings Council"
						bind:value={plantedBy}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Location -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<MapPin size={14} />
				Location
			</div>

			<div>
				<Label for="address" class="mb-1.5 text-[13px] font-medium text-stone-600">Address / Location Name</Label>
				<Input
					id="address"
					name="address"
					type="text"
					maxlength={200}
					placeholder="e.g. Cirencester Road, Charlton Kings"
					bind:value={address}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="latitude" class="mb-1.5 text-[13px] font-medium text-stone-600">Latitude *</Label>
					<Input
						id="latitude"
						name="latitude"
						type="text"
						required
						pattern="-?\d+\.?\d*"
						placeholder="e.g. 51.8826"
						bind:value={latitude}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('latitude') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
					/>
					{#if fieldError('latitude')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('latitude')}</p>
					{/if}
				</div>
				<div>
					<Label for="longitude" class="mb-1.5 text-[13px] font-medium text-stone-600">Longitude *</Label>
					<Input
						id="longitude"
						name="longitude"
						type="text"
						required
						pattern="-?\d+\.?\d*"
						placeholder="e.g. -2.0536"
						bind:value={longitude}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('latitude') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
					/>
				</div>
			</div>

			<Button
				type="button"
				variant="outline"
				onclick={useCurrentLocation}
				disabled={locating}
				class="gap-2 rounded-[10px] border-stone-200 text-[13px] font-medium text-stone-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
			>
				{#if locating}
					<LoaderCircle size={14} class="animate-spin" />
					Detecting...
				{:else}
					<Crosshair size={14} />
					Use Current Location
				{/if}
			</Button>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Tags & Features -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<Tag size={14} />
				Tags & Features
			</div>

			<div>
				<Label for="tags" class="mb-1.5 text-[13px] font-medium text-stone-600">Tags</Label>
				<Input
					id="tags"
					name="tags"
					type="text"
					placeholder="e.g. healthy, heritage, popular (comma separated)"
					bind:value={tags}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
				<p class="mt-1 text-[12px] text-stone-400">Separate multiple tags with commas.</p>
			</div>

			<div>
				<Label for="features" class="mb-1.5 text-[13px] font-medium text-stone-600">Features</Label>
				<Input
					id="features"
					name="features"
					type="text"
					placeholder="e.g. hollow trunk, bird boxes, bench nearby (comma separated)"
					bind:value={features}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
				<p class="mt-1 text-[12px] text-stone-400">Separate multiple features with commas.</p>
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Photos -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<Camera size={14} />
				Photos
			</div>

			<div>
				<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
					{#each photoPreviews as preview, i}
						<div class="group relative aspect-square overflow-hidden rounded-xl border border-stone-200">
							<img src={preview} alt="Photo {i + 1}" class="h-full w-full object-cover" />
							<button
								type="button"
								onclick={() => removePhoto(i)}
								class="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								<X size={12} />
							</button>
						</div>
					{/each}

					<button
						type="button"
						onclick={() => photoInput?.click()}
						class="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-stone-200 text-stone-400 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-600"
					>
						<div class="flex flex-col items-center gap-1">
							<Plus size={20} />
							<span class="text-[11px] font-medium">Add Photo</span>
						</div>
					</button>
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
				<p class="mt-2 text-[12px] text-stone-400">JPG, PNG, WebP or GIF. Max 10 MB each, up to 10 photos.</p>
				{#if fieldError('photos')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('photos')}</p>
				{/if}
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Submit -->
		<div class="flex justify-end gap-3 pb-8">
			<Button
				variant="outline"
				href="/trees"
				class="rounded-[10px] border-stone-200 px-5 py-2.5 text-[13px] font-medium text-stone-500"
			>
				Cancel
			</Button>
			<button
				type="submit"
				disabled={submitting || !name || !species || !latitude || !longitude}
				class="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if submitting}
					<LoaderCircle size={14} class="animate-spin" />
					Registering...
				{:else}
					<TreePine size={14} />
					Register Tree
				{/if}
			</button>
		</div>
	</form>
</div>
