<script lang="ts">
	import { Check } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		checked = $bindable(false),
		id = undefined,
		disabled = false,
		children
	}: {
		checked?: boolean;
		id?: string;
		disabled?: boolean;
		children?: Snippet;
	} = $props();
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	{id}
	{disabled}
	class="checkbox-root"
	class:checked
	class:disabled
	onclick={() => {
		if (!disabled) checked = !checked;
	}}
>
	<span class="checkbox-box">
		{#if checked}
			<Check size={12} strokeWidth={3} />
		{/if}
	</span>
	{#if children}
		<span class="checkbox-label">
			{@render children()}
		</span>
	{/if}
</button>

<style>
	.checkbox-root {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		font: inherit;
		color: inherit;
		outline: none;
	}

	.checkbox-root.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.checkbox-box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		margin-top: 1px;
		border-radius: 5px;
		border: 1.5px solid #d6d3d1;
		background: #ffffff;
		color: transparent;
		transition: all 0.15s ease;
	}

	.checkbox-root:hover .checkbox-box {
		border-color: #16a34a;
	}

	.checkbox-root:focus-visible .checkbox-box {
		box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
		border-color: #16a34a;
	}

	.checked .checkbox-box {
		background: linear-gradient(135deg, #16a34a, #15803d);
		border-color: #15803d;
		color: #ffffff;
		box-shadow: 0 1px 3px rgba(22, 163, 74, 0.25);
	}

	.checkbox-label {
		font-size: 12px;
		line-height: 1.5;
		color: #78716c;
	}
</style>
