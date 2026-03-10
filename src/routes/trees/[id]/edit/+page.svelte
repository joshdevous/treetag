<script lang="ts">
	import { enhance } from '$app/forms';
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
		ArrowLeft,
		Save,
		Trash2
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import DateInput from '$lib/components/DateInput.svelte';

	let { data, form } = $props();

	let submitting = $state(false);
	let deleting = $state(false);
	let confirmDeleteOpen = $state(false);
	let photoPreviews = $state<string[]>([]);
	let photoInput = $state<HTMLInputElement | null>(null);
	let removedPhotoIds = $state<string[]>([]);

	// Pre-fill form
	let name = $state(data.tree.name);
	let species = $state(data.tree.species);
	let estimatedAge = $state(data.tree.estimatedAge?.toString() ?? '');
	let height = $state(data.tree.height?.toString() ?? '');
	let trunkDiameter = $state(data.tree.trunkDiameter?.toString() ?? '');
	let plantedDate = $state(data.tree.plantedDate);
	let plantedBy = $state(data.tree.plantedBy);
	let latitude = $state(data.tree.location.coordinates[1].toString());
	let longitude = $state(data.tree.location.coordinates[0].toString());
	let address = $state(data.tree.location.address);
	let description = $state(data.tree.description);
	let tags = $state(data.tree.tags);
	let features = $state(data.tree.features);

	let locating = $state(false);

	const existingPhotos = $derived(data.tree.photos.filter((p: any) => !removedPhotoIds.includes(p.id)));

	function handlePhotoSelect(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (!files) return;
		for (const file of files) {
			photoPreviews.push(URL.createObjectURL(file));
		}
	}

	function removeNewPhoto(index: number) {
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

	function markPhotoForRemoval(id: string) {
		removedPhotoIds = [...removedPhotoIds, id];
	}

	function unmarkPhotoForRemoval(id: string) {
		removedPhotoIds = removedPhotoIds.filter((i) => i !== id);
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
				toast.success('Location updated!');
			},
			() => {
				locating = false;
				toast.error('Could not get your location.');
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});
</script>

<svelte:head>
	<title>Edit {data.tree.name} — Treetag</title>
</svelte:head>

<!-- Delete confirmation -->
<AlertDialog.Root bind:open={confirmDeleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this tree?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete <strong>{data.tree.name}</strong> and all its photos. This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance={() => { deleting = true; return async ({ update }) => { deleting = false; await update(); }; }}>
				<AlertDialog.Action type="submit" class="bg-red-600 text-white hover:bg-red-700">
					{#if deleting}
						<LoaderCircle size={14} class="animate-spin mr-1" />
					{/if}
					Delete Tree
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<div class="mx-auto max-w-3xl px-6 py-10">
	<a href="/trees/{data.tree.id}" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to tree
	</a>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
				Edit Tree
			</h1>
			<p class="mt-1 text-[14px] text-stone-400">
				Update details for {data.tree.name}
			</p>
		</div>
		<button
			onclick={() => confirmDeleteOpen = true}
			class="inline-flex items-center gap-2 rounded-[10px] border border-red-200 px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
		>
			<Trash2 size={14} />
			Delete
		</button>
	</div>

	<form
		method="POST"
		action="?/update"
		enctype="multipart/form-data"
		use:enhance={() => {
			submitting = true;
			return async ({ update, result }) => {
				submitting = false;
				if (result.type === 'redirect') return;
				await update();
			};
		}}
		class="space-y-8"
	>
		<input type="hidden" name="plantedDate" value={plantedDate} />

		<!-- Basic Info -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<TreePine size={14} />
				Tree Information
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="name" class="mb-1.5 text-[13px] font-medium text-stone-600">Tree Name *</Label>
					<Input id="name" name="name" type="text" required bind:value={name}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="species" class="mb-1.5 text-[13px] font-medium text-stone-600">Species *</Label>
					<Input id="species" name="species" type="text" required bind:value={species}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
			</div>

			<div>
				<Label for="description" class="mb-1.5 text-[13px] font-medium text-stone-600">Description</Label>
				<textarea id="description" name="description" rows={3} bind:value={description}
					class="w-full rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none"
				></textarea>
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
					<Input id="estimatedAge" name="estimatedAge" type="number" min={0} max={5000} bind:value={estimatedAge}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="height" class="mb-1.5 text-[13px] font-medium text-stone-600">Height (metres)</Label>
					<Input id="height" name="height" type="number" min={0} max={200} step={0.1} bind:value={height}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="trunkDiameter" class="mb-1.5 text-[13px] font-medium text-stone-600">Trunk Diameter (cm)</Label>
					<Input id="trunkDiameter" name="trunkDiameter" type="number" min={0} max={2000} step={0.1} bind:value={trunkDiameter}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="plantedDate" class="mb-1.5 text-[13px] font-medium text-stone-600">Planted Date</Label>
					<DateInput id="plantedDate" bind:value={plantedDate} maxToday={true} />
				</div>
				<div>
					<Label for="plantedBy" class="mb-1.5 text-[13px] font-medium text-stone-600">Planted By</Label>
					<Input id="plantedBy" name="plantedBy" type="text" bind:value={plantedBy}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
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
				<Input id="address" name="address" type="text" bind:value={address}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="latitude" class="mb-1.5 text-[13px] font-medium text-stone-600">Latitude *</Label>
					<Input id="latitude" name="latitude" type="text" required bind:value={latitude}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
				<div>
					<Label for="longitude" class="mb-1.5 text-[13px] font-medium text-stone-600">Longitude *</Label>
					<Input id="longitude" name="longitude" type="text" required bind:value={longitude}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100"
					/>
				</div>
			</div>

			<Button type="button" variant="outline" onclick={useCurrentLocation} disabled={locating}
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
				<Input id="tags" name="tags" type="text" placeholder="healthy, heritage, popular" bind:value={tags}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
				<p class="mt-1 text-[12px] text-stone-400">Comma separated.</p>
			</div>

			<div>
				<Label for="features" class="mb-1.5 text-[13px] font-medium text-stone-600">Features</Label>
				<Input id="features" name="features" type="text" placeholder="hollow trunk, bird boxes" bind:value={features}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
				/>
				<p class="mt-1 text-[12px] text-stone-400">Comma separated.</p>
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Photos -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<Camera size={14} />
				Photos
			</div>

			<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
				<!-- Existing photos -->
				{#each data.tree.photos as photo}
					{@const isRemoved = removedPhotoIds.includes(photo.id)}
					<div class="group relative aspect-square overflow-hidden rounded-xl border {isRemoved ? 'border-red-300 opacity-50' : 'border-stone-200'}">
						<img src={photo.url} alt={photo.caption || 'Tree photo'} class="h-full w-full object-cover" />
						{#if isRemoved}
							<input type="hidden" name="removePhoto" value={photo.id} />
							<button
								type="button"
								onclick={() => unmarkPhotoForRemoval(photo.id)}
								class="absolute inset-0 flex items-center justify-center bg-red-900/40 text-[11px] font-medium text-white"
							>
								Undo
							</button>
						{:else}
							<button
								type="button"
								onclick={() => markPhotoForRemoval(photo.id)}
								class="absolute right-1.5 top-1.5 rounded-full bg-red-600/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								<X size={12} />
							</button>
						{/if}
					</div>
				{/each}

				<!-- New photo previews -->
				{#each photoPreviews as preview, i}
					<div class="group relative aspect-square overflow-hidden rounded-xl border border-green-200">
						<img src={preview} alt="New photo {i + 1}" class="h-full w-full object-cover" />
						<div class="absolute left-1.5 top-1.5 rounded-full bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</div>
						<button
							type="button"
							onclick={() => removeNewPhoto(i)}
							class="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
						>
							<X size={12} />
						</button>
					</div>
				{/each}

				<!-- Add button -->
				<button
					type="button"
					onclick={() => photoInput?.click()}
					class="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-stone-200 text-stone-400 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-600"
				>
					<div class="flex flex-col items-center gap-1">
						<Plus size={20} />
						<span class="text-[11px] font-medium">Add</span>
					</div>
				</button>
			</div>
			<input type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple class="hidden" bind:this={photoInput} onchange={handlePhotoSelect} />
		</section>

		<Separator class="bg-stone-100" />

		<!-- Submit -->
		<div class="flex justify-end gap-3 pb-8">
			<Button variant="outline" href="/trees/{data.tree.id}"
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
					Saving...
				{:else}
					<Save size={14} />
					Save Changes
				{/if}
			</button>
		</div>
	</form>
</div>
