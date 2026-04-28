<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		Plus,
		Edit,
		Trash2,
		HelpCircle,
		Tag,
		Heart,
		Award,
		Leaf,
		BookOpen,
		LoaderCircle
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	type Entry = { id: string; question: string; answer: string; order: number };

	const ICONS: Record<string, typeof HelpCircle> = {
		general: HelpCircle,
		tagging: Tag,
		adoption: Heart,
		points: Award,
		'tree-care': Leaf
	};
	function iconFor(slug: string) {
		return ICONS[slug] ?? BookOpen;
	}

	let formOpen = $state(false);
	let editing = $state<Entry | null>(null);
	let confirmDelete = $state<Entry | null>(null);
	let submitting = $state(false);

	let formCategory = $state('general');
	let formQuestion = $state('');
	let formAnswer = $state('');
	let formOrder = $state('0');

	function openCreate(slug?: string) {
		editing = null;
		formCategory = slug ?? 'general';
		formQuestion = '';
		formAnswer = '';
		formOrder = '0';
		formOpen = true;
	}

	function openEdit(slug: string, entry: Entry) {
		editing = entry;
		formCategory = slug;
		formQuestion = entry.question;
		formAnswer = entry.answer;
		formOrder = String(entry.order ?? 0);
		formOpen = true;
	}

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const f = form as any;
		if (f?.success) {
			toast.success(f.success);
			formOpen = false;
			confirmDelete = null;
			editing = null;
		}
		if (f?.error) toast.error(f.error);
	});

	function fieldError(field: string): string | null {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const f = form as any;
		return f?.field === field ? f.error : null;
	}
</script>

<svelte:head>
	<title>Manage FAQ — Admin — Treetag</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-10">
	<a href="/admin" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-600">
		<ArrowLeft size={14} />
		Back to dashboard
	</a>

	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-stone-900" style="font-family: 'Playfair Display', serif;">
				Manage FAQ
			</h1>
			<p class="mt-1 text-[14px] text-stone-400">
				Add, edit, and reorder questions shown on the public FAQ page.
			</p>
		</div>
		<Button
			onclick={() => openCreate()}
			class="gap-2 rounded-[10px] bg-linear-to-r from-green-600 to-emerald-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm"
		>
			<Plus size={14} />
			New FAQ
		</Button>
	</div>

	<div class="space-y-8">
		{#each data.categories as cat}
			{@const Icon = iconFor(cat.slug)}
			<section class="rounded-2xl border border-stone-200 bg-white">
				<div class="flex items-center justify-between border-b border-stone-100 px-5 py-3">
					<div class="flex items-center gap-2">
						<div class="flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-600">
							<Icon size={14} />
						</div>
						<h2 class="text-[14px] font-bold text-stone-800">{cat.label}</h2>
						<span class="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">{cat.entries.length}</span>
					</div>
					<Button
						variant="outline"
						onclick={() => openCreate(cat.slug)}
						class="h-auto gap-1 rounded-[8px] border-stone-200 px-2.5 py-1 text-[12px] font-medium text-stone-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
					>
						<Plus size={12} />
						Add to {cat.label}
					</Button>
				</div>

				{#if cat.entries.length > 0}
					<ul class="divide-y divide-stone-100">
						{#each cat.entries as entry}
							<li class="flex items-start gap-4 px-5 py-3 hover:bg-stone-50/40">
								<span class="mt-0.5 inline-flex h-6 w-8 flex-shrink-0 items-center justify-center rounded-md bg-stone-100 font-mono text-[11px] font-semibold text-stone-500">{entry.order}</span>
								<div class="min-w-0 flex-1">
									<p class="text-[13px] font-semibold text-stone-800">{entry.question}</p>
									<p class="mt-1 line-clamp-2 text-[12px] text-stone-500">{entry.answer}</p>
								</div>
								<div class="flex shrink-0 gap-1">
									<Button variant="ghost" onclick={() => openEdit(cat.slug, entry)} class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800" title="Edit">
										<Edit size={14} />
									</Button>
									<Button variant="ghost" onclick={() => (confirmDelete = entry)} class="h-auto rounded-md p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600" title="Delete">
										<Trash2 size={14} />
									</Button>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="px-5 py-8 text-center text-[13px] text-stone-400">
						No FAQs in this category yet.
					</div>
				{/if}
			</section>
		{/each}
	</div>
</div>

<!-- Create / Edit dialog -->
<Dialog.Root bind:open={formOpen}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{editing ? 'Edit FAQ' : 'New FAQ'}</Dialog.Title>
			<Dialog.Description>
				{editing ? 'Update this question and answer.' : 'Add a new question to the public FAQ page.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action={editing ? '?/update' : '?/create'}
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
			class="space-y-4"
		>
			{#if editing}
				<input type="hidden" name="id" value={editing.id} />
			{/if}

			<div>
				<Label for="category" class="mb-1.5 text-[13px] font-medium text-stone-600">Category *</Label>
				<input type="hidden" name="category" value={formCategory} />
				<select
					id="category-preset"
					bind:value={formCategory}
					class="w-full rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100 {fieldError('category') ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}"
				>
					{#each data.categoryOptions as opt}
						<option value={opt.slug}>{opt.label}</option>
					{/each}
					{#if !data.categoryOptions.some((o) => o.slug === formCategory)}
						<option value={formCategory}>{formCategory} (custom)</option>
					{/if}
				</select>
				<p class="mt-1 text-[11px] text-stone-400">
					Or type a custom slug below to create a new category.
				</p>
				<Input
					id="category"
					value={formCategory}
					oninput={(e) => (formCategory = (e.currentTarget as HTMLInputElement).value)}
					placeholder="custom-slug"
					class="mt-1.5 h-auto rounded-[10px] border-stone-200 bg-white px-3 py-1.5 font-mono text-[12px] text-stone-700"
				/>
				{#if fieldError('category')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('category')}</p>
				{/if}
			</div>

			<div>
				<Label for="question" class="mb-1.5 text-[13px] font-medium text-stone-600">Question *</Label>
				<Input
					id="question"
					name="question"
					required
					maxlength={300}
					placeholder="What is Treetag?"
					bind:value={formQuestion}
					class="h-auto rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('question') ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}"
				/>
				{#if fieldError('question')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('question')}</p>
				{/if}
			</div>

			<div>
				<Label for="answer" class="mb-1.5 text-[13px] font-medium text-stone-600">Answer *</Label>
				<textarea
					id="answer"
					name="answer"
					required
					rows={5}
					maxlength={4000}
					placeholder="Plain text answer…"
					bind:value={formAnswer}
					class="w-full resize-none rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 placeholder:text-stone-300 outline-none transition-colors focus:border-green-400 focus:ring-2 focus:ring-green-100 {fieldError('answer') ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}"
				></textarea>
				<div class="mt-1 flex justify-between">
					{#if fieldError('answer')}
						<p class="text-[12px] text-red-500">{fieldError('answer')}</p>
					{:else}
						<span></span>
					{/if}
					<p class="text-[11px] text-stone-400">{formAnswer.length}/4,000</p>
				</div>
			</div>

			<div>
				<Label for="order" class="mb-1.5 text-[13px] font-medium text-stone-600">Display order</Label>
				<Input
					id="order"
					name="order"
					type="number"
					min={0}
					max={9999}
					bind:value={formOrder}
					class="h-auto w-32 rounded-[10px] border-stone-200 bg-white px-3.5 py-2.5 text-[14px] text-stone-800 focus-visible:border-green-400 focus-visible:ring-green-100 {fieldError('order') ? 'border-red-400' : ''}"
				/>
				<p class="mt-1 text-[11px] text-stone-400">Lower numbers appear first within the category.</p>
				{#if fieldError('order')}
					<p class="mt-1 text-[12px] text-red-500">{fieldError('order')}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (formOpen = false)} class="rounded-[10px] border-stone-200 text-[13px] text-stone-500">
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={submitting}
					class="gap-2 rounded-[10px] bg-linear-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm"
				>
					{#if submitting}
						<LoaderCircle size={14} class="animate-spin" />
						Saving…
					{:else}
						{editing ? 'Update FAQ' : 'Create FAQ'}
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirm -->
<AlertDialog.Root open={confirmDelete !== null} onOpenChange={(open) => { if (!open) confirmDelete = null; }}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete FAQ?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete <span class="font-semibold text-stone-800">"{confirmDelete?.question}"</span>. This cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={confirmDelete?.id} />
				<AlertDialog.Action type="submit" class="bg-red-600 text-white hover:bg-red-700">
					Delete permanently
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
