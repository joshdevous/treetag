<script lang="ts">
	import { ChevronsUpDown, LoaderCircle, Check } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Command from '$lib/components/ui/command';
	import { cn } from '$lib/utils';

	type ComboboxOption = {
		value: string;
		label?: string;
		description?: string;
		search?: string;
	};

	type SanitizeMode = 'none' | 'lower-alnum' | 'alnum' | 'alnum-space' | 'lower-alnum-space';

	let {
		id,
		value = $bindable(''),
		options = [],
		placeholder = 'Select option...',
		searchPlaceholder = 'Search or type...',
		emptyMessage = 'No matches found. Keep typing to use custom text.',
		allowCustom = true,
		loading = false,
		disabled = false,
		sanitizeMode = 'none',
		inputClass,
		onSelectValue,
		onCommitValue
	}: {
		id?: string;
		value?: string;
		options?: ComboboxOption[];
		placeholder?: string;
		searchPlaceholder?: string;
		emptyMessage?: string;
		allowCustom?: boolean;
		loading?: boolean;
		disabled?: boolean;
		sanitizeMode?: SanitizeMode;
		inputClass?: string;
		onSelectValue?: (value: string) => void;
		onCommitValue?: (value: string) => void;
	} = $props();

	let open = $state(false);
	let suppressFocusOpen = $state(false);
	let rootRef = $state<HTMLDivElement | null>(null);
	let activeIndex = $state(-1);
	let keyboardNavigating = $state(false);
	let mouseHoverIndex = $state(-1);

	function sanitizeInput(raw: string): string {
		if (sanitizeMode === 'lower-alnum') return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
		if (sanitizeMode === 'alnum') return raw.replace(/[^A-Za-z0-9]/g, '');
		if (sanitizeMode === 'alnum-space') return raw.replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ');
		if (sanitizeMode === 'lower-alnum-space') return raw.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
		return raw;
	}

	const filteredOptions = $derived.by(() => {
		const current = value.trim().toLowerCase();
		if (!current) return options.slice(0, 60);
		return options
			.filter((option) => {
				const searchText = (option.search ?? `${option.label ?? option.value} ${option.value}`).toLowerCase();
				return searchText.includes(current);
			})
			.slice(0, 60);
	});

	$effect(() => {
		if (!open) {
			activeIndex = -1;
			return;
		}

		if (filteredOptions.length === 0) {
			activeIndex = -1;
			return;
		}

		if (activeIndex >= 0 && activeIndex < filteredOptions.length) return;

		const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
		activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
	});

	function closeDropdown() {
		open = false;
	}

	function handleInput() {
		value = sanitizeInput(value);
		open = true;
		activeIndex = filteredOptions.length > 0 ? 0 : -1;
		keyboardNavigating = false;
		mouseHoverIndex = -1;
	}

	function handleFocus() {
		if (disabled) return;
		if (suppressFocusOpen) return;
		open = true;
	}

	function handleBlur() {
		suppressFocusOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) open = true;

			const count = filteredOptions.length;
			if (count === 0) return;

			if (!keyboardNavigating) {
				if (mouseHoverIndex >= 0 && mouseHoverIndex < count) {
					activeIndex = mouseHoverIndex;
				} else if (!(activeIndex >= 0 && activeIndex < count)) {
					const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
					activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
				}
			}

			keyboardNavigating = true;

			if (event.key === 'ArrowDown') {
				activeIndex = activeIndex < count - 1 ? activeIndex + 1 : 0;
			} else {
				activeIndex = activeIndex > 0 ? activeIndex - 1 : count - 1;
			}
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			closeDropdown();
			return;
		}

		if (event.key === 'Enter' && open) {
			const hasKeyboardActive = activeIndex >= 0 && activeIndex < filteredOptions.length;
			const hasMouseHover = mouseHoverIndex >= 0 && mouseHoverIndex < filteredOptions.length;
			const highlightedIndex = keyboardNavigating
				? hasKeyboardActive
					? activeIndex
					: -1
				: hasMouseHover
					? mouseHoverIndex
					: hasKeyboardActive
						? activeIndex
						: -1;

			if (highlightedIndex >= 0) {
				event.preventDefault();
				selectOption(filteredOptions[highlightedIndex]);
				return;
			}
		}

		if (event.key !== 'Enter') return;
		if (!allowCustom) return;

		const typed = sanitizeInput(value).trim();
		if (!typed) return;

		event.preventDefault();
		value = typed;
		onCommitValue?.(typed);
		suppressFocusOpen = true;
		closeDropdown();
	}

	function selectOption(option: ComboboxOption) {
		value = option.value;
		onSelectValue?.(option.value);
		open = true;
		keyboardNavigating = false;
	}

	function handleWindowMouseDown(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node | null;
		if (!target) return;
		if (rootRef?.contains(target)) return;
		closeDropdown();
	}

	function handleWindowMouseMove() {
		if (!open) return;
		if (!keyboardNavigating) return;
		keyboardNavigating = false;
		activeIndex = -1;
	}

	function handleListMouseMove(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const item = target?.closest('[data-option-index]') as HTMLElement | null;
		if (!item) return;

		const index = Number(item.dataset.optionIndex);
		if (Number.isNaN(index)) return;
		mouseHoverIndex = index;
	}

	function handleListMouseLeave() {
		mouseHoverIndex = -1;
	}
</script>

<svelte:window onmousedown={handleWindowMouseDown} />

<div class="relative w-full" bind:this={rootRef}>
	<Input
		{id}
		bind:value
		disabled={disabled}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		placeholder={searchPlaceholder || placeholder}
		autocomplete="off"
		autocapitalize="off"
		autocorrect="off"
		spellcheck={false}
		class={cn(
			'h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 pe-10 text-[14px] text-stone-800 placeholder:text-stone-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 focus-visible:border-green-400 focus-visible:ring-2 focus-visible:ring-green-100',
			open && 'border-green-400 ring-2 ring-green-100',
			inputClass
		)}
	/>
	<span class="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-stone-400">
		{#if loading}
			<LoaderCircle size={14} class="animate-spin opacity-60" />
		{:else}
			<ChevronsUpDown size={14} class="opacity-50" />
		{/if}
	</span>

	{#if open}
		<div class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground p-0 shadow-md outline-hidden">
			<Command.Root>
				<Command.List
					onmousemove={(event) => {
						handleWindowMouseMove();
						handleListMouseMove(event);
					}}
					onmouseleave={handleListMouseLeave}
				>
					<Command.Empty>{emptyMessage}</Command.Empty>
					<Command.Group>
						{#each filteredOptions as option, index (option.value)}
							<Command.Item
								value={option.value}
								data-option-index={index}
								class={cn(
									'justify-start text-left',
									keyboardNavigating &&
										(activeIndex === index
											? 'bg-accent text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground'
											: 'aria-selected:bg-transparent aria-selected:text-current')
								)}
								onSelect={() => {
									selectOption(option);
								}}
							>
								<Check class={cn('me-2 size-4', value !== option.value && 'text-transparent')} />
								{#if option.description}
									<div class="flex min-w-0 flex-col gap-0.5">
										<span class="truncate text-[12px] font-medium text-stone-700">{option.label ?? option.value}</span>
										<span class="truncate text-[11px] text-stone-500">{option.description}</span>
									</div>
								{:else}
									{option.label ?? option.value}
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</div>
	{/if}
</div>
