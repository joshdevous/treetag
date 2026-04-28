<script lang="ts">
	import { ChevronsUpDown, LoaderCircle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { cn } from '$lib/utils';

	type ComboboxOption = {
		value: string;
		label?: string;
		description?: string;
		search?: string;
	};

	type SanitizeMode = 'none' | 'lower-alnum' | 'alnum';

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
		triggerClass,
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
		triggerClass?: string;
		onSelectValue?: (value: string) => void;
		onCommitValue?: (value: string) => void;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	function sanitizeInput(raw: string): string {
		if (sanitizeMode === 'lower-alnum') return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
		if (sanitizeMode === 'alnum') return raw.replace(/[^A-Za-z0-9]/g, '');
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

	function closePopover() {
		open = false;
		triggerRef?.focus();
	}

	function handleInputChange() {
		value = sanitizeInput(value);
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		if (!allowCustom) return;

		const typed = sanitizeInput(value).trim();
		if (!typed) return;

		event.preventDefault();
		event.stopPropagation();
		value = typed;
		onCommitValue?.(typed);
		closePopover();
	}

	function selectOption(option: ComboboxOption) {
		value = option.value;
		onSelectValue?.(option.value);
		closePopover();
	}
</script>

<Popover.Root bind:open={open}>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				{id}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				disabled={disabled}
				class={cn(
					'h-auto w-full justify-between rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] font-normal hover:bg-white focus-visible:border-green-400 focus-visible:ring-2 focus-visible:ring-green-100',
					open && 'border-green-400 ring-2 ring-green-100',
					value ? 'text-stone-800' : 'text-stone-300',
					triggerClass
				)}
			>
				{value || placeholder}
				{#if loading}
					<LoaderCircle size={14} class="animate-spin opacity-60" />
				{:else}
					<ChevronsUpDown size={14} class="opacity-50" />
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) p-0" align="start">
		<Command.Root>
			<Command.Input
				bind:value
				oninput={handleInputChange}
				onkeydown={handleInputKeydown}
				placeholder={searchPlaceholder}
			/>
			<Command.List>
				<Command.Empty>{emptyMessage}</Command.Empty>
				<Command.Group>
					{#each filteredOptions as option (option.value)}
						<Command.Item
							value={option.value}
							onSelect={() => {
								selectOption(option);
							}}
						>
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
	</Popover.Content>
</Popover.Root>
