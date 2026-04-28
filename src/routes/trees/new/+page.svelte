<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import {
		TreePine,
		MapPin,
		Ruler,
		Camera,
		Tag,
		X,
		LoaderCircle,
		Plus,
		Crosshair,
		ArrowLeft,
		CircleDashed,
		ChevronUp,
		ChevronDown
	} from 'lucide-svelte';
	import { parseDate } from '@internationalized/date';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import DateInput from '$lib/components/DateInput.svelte';
	import InputCombobox from '$lib/components/combobox/InputCombobox.svelte';
	import LovCombobox from '$lib/components/combobox/LovCombobox.svelte';

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
	let postcode = $state('');
	let address = $state('');
	let latitude = $state('');
	let longitude = $state('');
	let description = $state('');

	let locating = $state(false);
	let isFetchingAddresses = $state(false);

	type LookupAddressOption = {
		id: string;
		shortAddress: string;
	};

	let addressOptions = $state<LookupAddressOption[]>([]);

	// Tag chips
	let tags = $state<string[]>([]);
	let tagInput = $state('');

	// Feature chips
	let features = $state<string[]>([]);
	let featureInput = $state('');

	const isDev = $derived($page.url.hostname === 'localhost');
	let postcodeDebounce: ReturnType<typeof setTimeout>;

	const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
	const availableSpecies = $derived(data.speciesSuggestions ?? []);
	const plantedBySuggestions = $derived(data.plantedBySuggestions ?? []);
	const tagSuggestions = $derived(data.tagSuggestions ?? []);
	const featureSuggestions = $derived(data.featureSuggestions ?? []);

	const addressComboboxOptions = $derived.by(() =>
		addressOptions.map((option) => ({
			value: option.shortAddress,
			label: option.shortAddress,
			search: option.shortAddress
		}))
	);

	const tagMatches = $derived.by(() => {
		const current = tagInput.trim().toLowerCase();
		const selected = new Set(tags.map((t) => t.toLowerCase()));
		const seen = new Set<string>();
		const normalized = tagSuggestions
			.map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
			.filter((s: string) => s.length > 0 && !selected.has(s));
		return normalized
			.filter((s: string) => {
				if (seen.has(s)) return false;
				seen.add(s);
				return !current || s.includes(current);
			})
			.slice(0, 8);
	});

	const featureMatches = $derived.by(() => {
		const current = featureInput.trim().toLowerCase();
		const selected = new Set(features.map((f) => f.toLowerCase()));
		const seen = new Set<string>();
		return featureSuggestions
			.map((s: string) => s.replace(/[^A-Za-z0-9]/g, ''))
			.filter((s: string) => s.length > 0 && !selected.has(s.toLowerCase()))
			.filter((s: string) => {
				const key = s.toLowerCase();
				if (seen.has(key)) return false;
				seen.add(key);
				return !current || key.includes(current);
			})
			.slice(0, 8);
	});

	function addChip(kind: 'tag' | 'feature') {
		const rawValue = (kind === 'tag' ? tagInput : featureInput).trim().replace(/,$/, '');
		const value =
			kind === 'tag'
				? rawValue.toLowerCase().replace(/[^a-z0-9]/g, '')
				: rawValue.replace(/[^A-Za-z0-9]/g, '');
		if (!value) return;

		const list = kind === 'tag' ? tags : features;
		if (list.some((item) => item.toLowerCase() === value.toLowerCase())) {
			if (kind === 'tag') tagInput = '';
			else featureInput = '';
			return;
		}

		if (kind === 'tag') {
			tags = [...tags, value];
			tagInput = '';
		} else {
			features = [...features, value];
			featureInput = '';
		}
	}

	function removeChip(kind: 'tag' | 'feature', index: number) {
		if (kind === 'tag') tags = tags.filter((_, i) => i !== index);
		else features = features.filter((_, i) => i !== index);
	}

	function addSuggestedChip(kind: 'tag' | 'feature', value: string) {
		if (kind === 'tag') {
			tagInput = value;
		} else {
			featureInput = value;
		}
		addChip(kind);
	}

	function applySelectedAddress(value: string) {
		address = value;
	}

	function stepNumber(field: 'estimatedAge' | 'height' | 'trunkDiameter', direction: 1 | -1) {
		const config = {
			estimatedAge: { step: 1, min: 0, max: 5000, decimals: 0 },
			height: { step: 0.1, min: 0, max: 200, decimals: 1 },
			trunkDiameter: { step: 0.1, min: 0, max: 2000, decimals: 1 }
		}[field];

		const value = field === 'estimatedAge' ? estimatedAge : field === 'height' ? height : trunkDiameter;
		const current = value ? Number(value) : 0;
		if (Number.isNaN(current)) return;

		let next = current + config.step * direction;
		next = Math.min(config.max, Math.max(config.min, next));

		const formatted = config.decimals === 0 ? String(Math.round(next)) : next.toFixed(config.decimals);

		if (field === 'estimatedAge') estimatedAge = formatted;
		if (field === 'height') height = formatted;
		if (field === 'trunkDiameter') trunkDiameter = formatted;
	}

	async function lookupAddresses(force = false) {
		const cleanPostcode = postcode.trim();
		if (!cleanPostcode) {
			addressOptions = [];
			return;
		}

		isFetchingAddresses = true;
		try {
			const response = await fetch(`/api/address/find/${encodeURIComponent(cleanPostcode)}`);
			if (!response.ok) throw new Error(`Lookup failed (${response.status})`);
			const payload = (await response.json()) as Array<Record<string, unknown>>;
			addressOptions = Array.isArray(payload)
				? payload
					.map((item) => {
						const id = typeof item.id === 'string' ? item.id : '';
						const shortAddress = typeof item.shortAddress === 'string' ? item.shortAddress : '';
						if (!id || !shortAddress) return null;
						return { id, shortAddress };
					})
					.filter((item): item is LookupAddressOption => item !== null)
				: [];
			if (force && addressOptions.length === 0) {
				toast.info('No addresses found for that postcode.');
			}
		} catch {
			if (force) toast.error('Could not fetch addresses for that postcode.');
			addressOptions = [];
		} finally {
			isFetchingAddresses = false;
		}
	}

	function handlePostcodeInput() {
		clearTimeout(postcodeDebounce);
		postcodeDebounce = setTimeout(() => lookupAddresses(false), 450);
	}

	function buildLocalAddressFromNominatim(addr: Record<string, unknown>): string {
		const localParts = [
			addr.road,
			addr.neighbourhood,
			addr.suburb,
			addr.hamlet,
			addr.village,
			addr.town,
			addr.city,
			addr.city_district,
			addr.state_district,
			addr.county
		].filter((v): v is string => typeof v === 'string' && v.trim().length > 0);

		const seen = new Set<string>();
		const unique = localParts.filter((part) => {
			const key = part.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		return unique.join(', ');
	}

	async function reverseLookupAddress(lat: string, lng: string) {
		try {
			const url = new URL('https://nominatim.openstreetmap.org/reverse');
			url.searchParams.set('format', 'jsonv2');
			url.searchParams.set('lat', lat);
			url.searchParams.set('lon', lng);
			url.searchParams.set('addressdetails', '1');

			const res = await fetch(url.toString(), {
				headers: { Accept: 'application/json' }
			});
			if (!res.ok) return;

			const payload = await res.json();
			const addr = payload?.address ?? {};
			const guessedPostcode = typeof addr.postcode === 'string' ? addr.postcode : '';
			const guessedAddress = buildLocalAddressFromNominatim(addr);

			if (guessedPostcode) {
				postcode = guessedPostcode;
				void lookupAddresses(false);
			}
			if (guessedAddress) {
				address = guessedAddress;
			}
		} catch {
			// Reverse lookup is best-effort only.
		}
	}

	function fillMockData() {
		name = 'The Great Beech of Beeches Way';
		species = 'European Beech';
		description = 'A magnificent mature beech tree with a wide spreading canopy that provides excellent shade in summer. The trunk has several initials carved into the bark dating back decades, and the roots form a dramatic buttress pattern at the base.';
		estimatedAge = '120';
		height = '22';
		trunkDiameter = '95';
		plantedDate = '15/03/1906';
		plantedBy = 'Charlton Kings Parish Council';
		postcode = 'GL53 8PQ';
		address = 'Beeches Way, Charlton Kings';
		latitude = '51.8841';
		longitude = '-2.0498';
		tags = ['heritage', 'mature', 'shady', 'landmark'];
		features = ['WideCanopy', 'ButtressRoots', 'CarvedInitials', 'BirdNestingSite'];
		void lookupAddresses(false);
	}

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
				reverseLookupAddress(latitude, longitude);
				locating = false;
				toast.success('Location detected and address details prefilled.');
			},
			() => {
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
				<Button
					type="button"
					variant="outline"
					onclick={fillMockData}
					class="h-auto shrink-0 rounded-[10px] border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700 hover:bg-amber-100"
				>
					Fill Mock Data
				</Button>
			{/if}
		</div>
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
		<input type="hidden" name="species" value={species} />
		<input type="hidden" name="plantedDate" value={plantedDate} />
		<input type="hidden" name="plantedBy" value={plantedBy} />
		<input type="hidden" name="address" value={address} />
		<input type="hidden" name="tags" value={tags.join(', ')} />
		<input type="hidden" name="features" value={features.join(', ')} />
		<input type="hidden" name="postcode" value={postcode} />

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
					<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Species *</Label>
					<LovCombobox
						id="species"
						bind:value={species}
						suggestions={availableSpecies}
						sanitizeMode="alnum-space"
						placeholder="Select species..."
						searchPlaceholder="Search species or type your own..."
						emptyMessage="No species found. Keep typing to use custom text."
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
					<div class="relative">
						<Input
							id="estimatedAge"
							name="estimatedAge"
							type="number"
							min={0}
							max={5000}
							placeholder="e.g. 150"
							bind:value={estimatedAge}
							class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 pe-10 text-[14px] text-stone-800 placeholder:text-stone-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:border-green-400 focus-visible:ring-green-100"
						/>
						<div class="absolute inset-y-0 right-1 flex flex-col justify-center">
							<Button type="button" variant="ghost" class="h-4 px-1 text-stone-500 hover:text-stone-700" onclick={() => stepNumber('estimatedAge', 1)}><ChevronUp size={12} /></Button>
							<Button type="button" variant="ghost" class="h-4 px-1 text-stone-500 hover:text-stone-700" onclick={() => stepNumber('estimatedAge', -1)}><ChevronDown size={12} /></Button>
						</div>
					</div>
				</div>
				<div>
					<Label for="height" class="mb-1.5 text-[13px] font-medium text-stone-600">Height (metres)</Label>
					<div class="relative">
						<Input
							id="height"
							name="height"
							type="number"
							min={0}
							max={200}
							step={0.1}
							placeholder="e.g. 25"
							bind:value={height}
							class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 pe-10 text-[14px] text-stone-800 placeholder:text-stone-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:border-green-400 focus-visible:ring-green-100"
						/>
						<div class="absolute inset-y-0 right-1 flex flex-col justify-center">
							<Button type="button" variant="ghost" class="h-4 px-1 text-stone-500 hover:text-stone-700" onclick={() => stepNumber('height', 1)}><ChevronUp size={12} /></Button>
							<Button type="button" variant="ghost" class="h-4 px-1 text-stone-500 hover:text-stone-700" onclick={() => stepNumber('height', -1)}><ChevronDown size={12} /></Button>
						</div>
					</div>
				</div>
				<div>
					<Label for="trunkDiameter" class="mb-1.5 text-[13px] font-medium text-stone-600">Trunk Diameter (cm)</Label>
					<div class="relative">
						<Input
							id="trunkDiameter"
							name="trunkDiameter"
							type="number"
							min={0}
							max={2000}
							step={0.1}
							placeholder="e.g. 100"
							bind:value={trunkDiameter}
							class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 pe-10 text-[14px] text-stone-800 placeholder:text-stone-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:border-green-400 focus-visible:ring-green-100"
						/>
						<div class="absolute inset-y-0 right-1 flex flex-col justify-center">
							<Button type="button" variant="ghost" class="h-4 px-1 text-stone-500 hover:text-stone-700" onclick={() => stepNumber('trunkDiameter', 1)}><ChevronUp size={12} /></Button>
							<Button type="button" variant="ghost" class="h-4 px-1 text-stone-500 hover:text-stone-700" onclick={() => stepNumber('trunkDiameter', -1)}><ChevronDown size={12} /></Button>
						</div>
					</div>
				</div>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label class="mb-1.5 text-[13px] font-medium text-stone-600">Planted Date</Label>
					<DateInput id="plantedDate" bind:value={plantedDate} maxToday={true} />
					{#if fieldError('plantedDate')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('plantedDate')}</p>
					{/if}
				</div>
				<div>
					<Label for="plantedBy" class="mb-1.5 text-[13px] font-medium text-stone-600">Planted By</Label>
					<LovCombobox
						id="plantedBy"
						bind:value={plantedBy}
						suggestions={plantedBySuggestions}
						sanitizeMode="alnum-space"
						placeholder="Select or type planter..."
						searchPlaceholder="Search or type who planted it..."
						emptyMessage="No matches found. Keep typing to use custom text."
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

			<div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
				<div>
					<Label for="postcode" class="mb-1.5 text-[13px] font-medium text-stone-600">Postcode</Label>
					<div class="relative">
						<Input
							id="postcode"
							name="postcode_display"
							type="text"
							placeholder="e.g. GL53 8PQ"
							bind:value={postcode}
							oninput={handlePostcodeInput}
							class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 pe-10 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100"
						/>
						{#if postcode.trim()}
							<span class="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-[11px] font-medium text-stone-400">
								{#if isFetchingAddresses}
									<LoaderCircle size={14} class="animate-spin" />
								{:else}
									{addressOptions.length} results
								{/if}
							</span>
						{/if}
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					onclick={useCurrentLocation}
					disabled={locating}
					class="h-auto rounded-[10px] border-stone-200 px-3.5 py-2.5 text-[13px] font-medium text-stone-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
				>
					{#if locating}
						<LoaderCircle size={14} class="animate-spin" />
					{:else}
						<Crosshair size={14} />
					{/if}
					Use Current Location
				</Button>
			</div>

			<div>
				<Label for="address" class="mb-1.5 text-[13px] font-medium text-stone-600">Address / Location Name</Label>
				<InputCombobox
					id="address"
					bind:value={address}
					options={addressComboboxOptions}
					loading={isFetchingAddresses}
					placeholder="Start typing or choose from postcode suggestions"
					searchPlaceholder="Search or type location name..."
					emptyMessage="No matches found. Keep typing to use custom text."
					onSelectValue={applySelectedAddress}
				/>
				{#if fieldError('address')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('address')}</p>
				{/if}
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<Label for="latitude" class="mb-1.5 text-[13px] font-medium text-stone-600">Latitude *</Label>
					<Input
						id="latitude"
						name="latitude"
						type="text"
						required
						inputmode="decimal"
						pattern="-?(90(\.0+)?|[1-8]?\d(\.\d+)?)"
						title="A decimal number between -90 and 90 (e.g. 51.8826)"
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
						inputmode="decimal"
						pattern="-?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d\d?(\.\d+)?)"
						title="A decimal number between -180 and 180 (e.g. -2.0536)"
						placeholder="e.g. -2.0536"
						bind:value={longitude}
						class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('longitude') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
					/>
					{#if fieldError('longitude')}
						<p class="mt-1 text-[12px] text-red-500">{fieldError('longitude')}</p>
					{/if}
				</div>
			</div>
		</section>

		<Separator class="bg-stone-100" />

		<!-- Tags & Features -->
		<section class="space-y-5">
			<div class="flex items-center gap-2 text-[13px] font-semibold text-stone-500 uppercase tracking-wider">
				<Tag size={14} />
				Tags & Features
			</div>

			<div>
				<Label for="tagInput" class="mb-1.5 text-[13px] font-medium text-stone-600">Tags</Label>
				<LovCombobox
					id="tagInput"
					bind:value={tagInput}
					suggestions={tagMatches}
					sanitizeMode="lower-alnum"
					placeholder="Search tags or type your own..."
					searchPlaceholder="Search tags or type your own..."
					emptyMessage="No tag matches. Press Enter to add custom text."
					onSelectValue={(value) => addSuggestedChip('tag', value)}
					onCommitValue={(value) => addSuggestedChip('tag', value)}
				/>
				{#if tags.length > 0}
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each tags as item, i}
							<Badge class="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
								{item}
								<Button type="button" variant="ghost" class="ms-1 h-auto px-0 text-green-700 hover:bg-transparent" onclick={() => removeChip('tag', i)}>
									<X size={11} />
								</Button>
							</Badge>
						{/each}
					</div>
				{/if}
				<p class="mt-1 text-[12px] text-stone-400">Press Enter to add each tag.</p>
				{#if fieldError('tags')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('tags')}</p>
				{/if}
			</div>

			<div>
				<Label for="featureInput" class="mb-1.5 text-[13px] font-medium text-stone-600">Features</Label>
				<LovCombobox
					id="featureInput"
					bind:value={featureInput}
					suggestions={featureMatches}
					sanitizeMode="alnum"
					placeholder="Search features or type your own..."
					searchPlaceholder="Search features or type your own..."
					emptyMessage="No feature matches. Press Enter to add custom text."
					onSelectValue={(value) => addSuggestedChip('feature', value)}
					onCommitValue={(value) => addSuggestedChip('feature', value)}
				/>
				{#if features.length > 0}
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each features as item, i}
							<Badge class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
								{item}
								<Button type="button" variant="ghost" class="ms-1 h-auto px-0 text-emerald-700 hover:bg-transparent" onclick={() => removeChip('feature', i)}>
									<X size={11} />
								</Button>
							</Badge>
						{/each}
					</div>
				{/if}
				<p class="mt-1 text-[12px] text-stone-400">Press Enter to add each feature.</p>
				{#if fieldError('features')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('features')}</p>
				{/if}
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
							<Button
								type="button"
								variant="ghost"
								onclick={() => removePhoto(i)}
								class="absolute right-1.5 top-1.5 h-auto rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
							>
								<X size={12} />
							</Button>
						</div>
					{/each}

					<Button
						type="button"
						variant="outline"
						onclick={() => photoInput?.click()}
						class="h-auto flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-stone-200 text-stone-400 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-600"
					>
						<div class="flex flex-col items-center gap-1">
							<Plus size={20} />
							<span class="text-[11px] font-medium">Add Photo</span>
						</div>
					</Button>
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
		{#if !data.isAdmin}
			<div class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
				<CircleDashed size={18} class="mt-0.5 shrink-0 text-amber-600" />
				<p class="text-[13px] text-amber-700">Your submission will be reviewed by an admin before it appears publicly on the map. You'll be able to edit your tree while it's pending.</p>
			</div>
		{/if}

		<div class="flex justify-end gap-3 pb-8">
			<Button
				variant="outline"
				href="/trees"
				class="rounded-[10px] border-stone-200 px-5 py-2.5 text-[13px] font-medium text-stone-500"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				variant="default"
				disabled={submitting || !name || !species || !latitude || !longitude}
				class="inline-flex items-center gap-2 rounded-[10px] bg-linear-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if submitting}
					<LoaderCircle size={14} class="animate-spin" />
					Registering...
				{:else}
					<TreePine size={14} />
					Register Tree
				{/if}
			</Button>
		</div>
	</form>
</div>
