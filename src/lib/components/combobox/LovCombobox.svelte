<script lang="ts">
	import InputCombobox from '$lib/components/combobox/InputCombobox.svelte';

	type SanitizeMode = 'none' | 'lower-alnum' | 'alnum' | 'alnum-space' | 'lower-alnum-space';

	let {
		id,
		value = $bindable(''),
		suggestions = [],
		placeholder = 'Select option...',
		searchPlaceholder = 'Search or type...',
		emptyMessage = 'No matches found. Keep typing to use custom text.',
		sanitizeMode = 'none',
		onSelectValue,
		onCommitValue
	}: {
		id?: string;
		value?: string;
		suggestions?: string[];
		placeholder?: string;
		searchPlaceholder?: string;
		emptyMessage?: string;
		sanitizeMode?: SanitizeMode;
		onSelectValue?: (value: string) => void;
		onCommitValue?: (value: string) => void;
	} = $props();

	function sanitizeSuggestion(raw: string): string {
		if (sanitizeMode === 'lower-alnum') return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
		if (sanitizeMode === 'alnum') return raw.replace(/[^A-Za-z0-9]/g, '');
		if (sanitizeMode === 'alnum-space') return raw.replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
		if (sanitizeMode === 'lower-alnum-space') return raw.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
		return raw.trim();
	}

	const options = $derived.by(() => {
		const seen = new Set<string>();
		return suggestions
			.map((suggestion) => sanitizeSuggestion(suggestion))
			.filter((suggestion) => {
				if (!suggestion) return false;
				const key = sanitizeMode === 'none' ? suggestion.toLowerCase() : suggestion;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			})
			.map((suggestion) => ({ value: suggestion, label: suggestion }));
	});
</script>

<InputCombobox
	{id}
	bind:value
	{options}
	{placeholder}
	{searchPlaceholder}
	{emptyMessage}
	{sanitizeMode}
	{onSelectValue}
	{onCommitValue}
/>
