<script lang="ts">
	import { Calendar as CalendarIcon, Slash } from 'lucide-svelte';
	import { CalendarDate, parseDate, today, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar } from '$lib/components/ui/calendar';
	import { cn } from '$lib/utils';

	let {
		id = 'date-input',
		value = $bindable(''),
		placeholder = 'DD/MM/YYYY',
		maxToday = false,
		class: className
	}: {
		id?: string;
		value?: string;
		placeholder?: string;
		maxToday?: boolean;
		class?: string;
	} = $props();

	let open = $state(false);
	let calendarValue = $state<CalendarDate | undefined>(undefined);
	let dayRef = $state<HTMLInputElement | null>(null);
	let monthRef = $state<HTMLInputElement | null>(null);
	let yearRef = $state<HTMLInputElement | null>(null);
	let controlRef = $state<HTMLDivElement | null>(null);

	let dayPart = $state('');
	let monthPart = $state('');
	let yearPart = $state('');

	function toDisplayDate(v: CalendarDate): string {
		const d = String(v.day).padStart(2, '0');
		const m = String(v.month).padStart(2, '0');
		const y = String(v.year).padStart(4, '0');
		return `${d}/${m}/${y}`;
	}

	function setPartsFromCalendar(v: CalendarDate) {
		dayPart = String(v.day).padStart(2, '0');
		monthPart = String(v.month).padStart(2, '0');
		yearPart = String(v.year).padStart(4, '0');
	}

	function setPartsFromText(raw: string) {
		const parsed = parseTypedDate(raw);
		if (parsed) {
			setPartsFromCalendar(parsed);
			return;
		}

		const digits = raw.replace(/\D/g, '').slice(0, 8);
		dayPart = digits.slice(0, 2);
		monthPart = digits.slice(2, 4);
		yearPart = digits.slice(4, 8);
	}

	function parseTypedDate(raw: string): CalendarDate | undefined {
		const text = raw.trim();
		if (!text) return undefined;

		try {
			return parseDate(text);
		} catch {
			// fall through
		}

		const dmy = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
		if (dmy) {
			const day = Number(dmy[1]);
			const month = Number(dmy[2]);
			const year = Number(dmy[3]);
			if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
				return new CalendarDate(year, month, day);
			}
		}

		const ymd = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
		if (ymd) {
			const year = Number(ymd[1]);
			const month = Number(ymd[2]);
			const day = Number(ymd[3]);
			if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
				return new CalendarDate(year, month, day);
			}
		}

		const compact = text.match(/^(\d{2})(\d{2})(\d{4})$/);
		if (compact) {
			const day = Number(compact[1]);
			const month = Number(compact[2]);
			const year = Number(compact[3]);
			if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
				return new CalendarDate(year, month, day);
			}
		}

		return undefined;
	}

	function buildValueFromParts(): string {
		if (!dayPart && !monthPart && !yearPart) return '';
		if (dayPart.length === 2 && monthPart.length === 2 && yearPart.length === 4) {
			return `${dayPart}/${monthPart}/${yearPart}`;
		}
		const d = dayPart;
		const m = monthPart;
		const y = yearPart;
		if (!m && !y) return d;
		if (!y) return `${d}/${m}`;
		return `${d}/${m}/${y}`;
	}

	function syncValueFromParts() {
		value = buildValueFromParts();
		calendarValue = parseTypedDate(value ?? '');
	}

	function getRef(part: 'day' | 'month' | 'year'): HTMLInputElement | null {
		if (part === 'day') return dayRef;
		if (part === 'month') return monthRef;
		return yearRef;
	}

	function focusRef(part: 'day' | 'month' | 'year', toEnd = false) {
		const el = getRef(part);
		if (!el) return;
		el.focus();
		const pos = toEnd ? el.value.length : 0;
		el.setSelectionRange(pos, pos);
	}

	function setPart(part: 'day' | 'month' | 'year', raw: string) {
		const maxLen = part === 'year' ? 4 : 2;
		const cleaned = raw.replace(/\D/g, '').slice(0, maxLen);
		if (part === 'day') dayPart = cleaned;
		if (part === 'month') monthPart = cleaned;
		if (part === 'year') yearPart = cleaned;
	}

	function getPart(part: 'day' | 'month' | 'year'): string {
		if (part === 'day') return dayPart;
		if (part === 'month') return monthPart;
		return yearPart;
	}

	function handlePartInput(part: 'day' | 'month' | 'year', event: Event) {
		const el = event.currentTarget as HTMLInputElement;
		setPart(part, el.value);
		syncValueFromParts();

		if (part === 'day' && dayPart.length === 2) focusRef('month');
		if (part === 'month' && monthPart.length === 2) focusRef('year');
	}

	function handlePartKeydown(part: 'day' | 'month' | 'year', event: KeyboardEvent) {
		const el = event.currentTarget as HTMLInputElement;
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;

		if (event.key === '/') {
			event.preventDefault();
			if (part === 'day') focusRef('month');
			if (part === 'month') focusRef('year');
			return;
		}

		if (event.key === 'ArrowLeft' && start === 0 && end === 0) {
			if (part === 'month') {
				event.preventDefault();
				focusRef('day', true);
			}
			if (part === 'year') {
				event.preventDefault();
				focusRef('month', true);
			}
		}

		if (event.key === 'ArrowRight' && start === el.value.length && end === el.value.length) {
			if (part === 'day') {
				event.preventDefault();
				focusRef('month');
			}
			if (part === 'month') {
				event.preventDefault();
				focusRef('year');
			}
		}

		if (event.key === 'Backspace' && !getPart(part)) {
			if (part === 'month') {
				event.preventDefault();
				focusRef('day', true);
			}
			if (part === 'year') {
				event.preventDefault();
				focusRef('month', true);
			}
		}
	}

	function handlePartPaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text') ?? '';
		const parsed = parseTypedDate(text);
		if (parsed) {
			setPartsFromCalendar(parsed);
			syncValueFromParts();
			focusRef('year', true);
			return;
		}

		const digits = text.replace(/\D/g, '').slice(0, 8);
		dayPart = digits.slice(0, 2);
		monthPart = digits.slice(2, 4);
		yearPart = digits.slice(4, 8);
		syncValueFromParts();
	}

	function focusBestPartFromContainerMouseDown(event: MouseEvent) {
		if (!controlRef) return;
		const target = event.target as HTMLElement;
		if (target.closest('input') || target.closest('button')) return;
		event.preventDefault();

		const rect = controlRef.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const ratio = x / rect.width;

		if (ratio < 0.33) {
			focusRef('day', true);
			return;
		}
		if (ratio < 0.66) {
			focusRef('month', true);
			return;
		}
		focusRef('year', true);
	}

	function normalizeInput() {
		const parsed = parseTypedDate(buildValueFromParts());
		if (parsed) {
			setPartsFromCalendar(parsed);
			value = toDisplayDate(parsed);
			calendarValue = parsed;
		}
	}

	$effect(() => {
		const current = buildValueFromParts();
		if ((value ?? '') !== current) setPartsFromText(value ?? '');
		calendarValue = parseTypedDate(buildValueFromParts());
	});
</script>

<div class="relative">
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={controlRef}
		onmousedown={focusBestPartFromContainerMouseDown}
		role="group"
		aria-label="Date input"
		class={cn(
			'h-auto cursor-text rounded-[10px] border border-stone-200 bg-white px-3.5 py-2.5 pe-11 text-[14px] text-stone-800 transition-colors focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100',
			className
		)}
	>
		<div class="flex items-center gap-1.5">
			<input
				{id}
				bind:this={dayRef}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				maxlength={2}
				placeholder="DD"
				value={dayPart}
				oninput={(e) => handlePartInput('day', e)}
				onkeydown={(e) => handlePartKeydown('day', e)}
				onpaste={handlePartPaste}
				onblur={normalizeInput}
				class="w-8 cursor-text bg-transparent text-center text-[14px] text-stone-800 outline-none placeholder:text-stone-300"
			/>
			<Slash size={11} class="pointer-events-none -rotate-18 text-stone-500" />
			<input
				id={`${id}-month`}
				bind:this={monthRef}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				maxlength={2}
				placeholder="MM"
				value={monthPart}
				oninput={(e) => handlePartInput('month', e)}
				onkeydown={(e) => handlePartKeydown('month', e)}
				onpaste={handlePartPaste}
				onblur={normalizeInput}
				class="w-8 cursor-text bg-transparent text-center text-[14px] text-stone-800 outline-none placeholder:text-stone-300"
			/>
			<Slash size={11} class="pointer-events-none -rotate-18 text-stone-500" />
			<input
				id={`${id}-year`}
				bind:this={yearRef}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				maxlength={4}
				placeholder="YYYY"
				value={yearPart}
				oninput={(e) => handlePartInput('year', e)}
				onkeydown={(e) => handlePartKeydown('year', e)}
				onpaste={handlePartPaste}
				onblur={normalizeInput}
				class="w-14 cursor-text bg-transparent text-center text-[14px] text-stone-800 outline-none placeholder:text-stone-300"
			/>
		</div>
	</div>

	<Popover.Root bind:open>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					type="button"
					variant="ghost"
					class="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
				>
					<CalendarIcon size={14} />
					<span class="sr-only">Open calendar</span>
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto overflow-hidden p-0" align="end">
			<Calendar
				type="single"
				bind:value={calendarValue}
				captionLayout="dropdown"
				maxValue={maxToday ? today(getLocalTimeZone()) : undefined}
				onValueChange={(v: DateValue | undefined) => {
					if (v) {
						setPartsFromCalendar(v as CalendarDate);
						syncValueFromParts();
					}
					open = false;
				}}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
