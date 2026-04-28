import { LovValueModel } from '$lib/server/db/models/lov-value';

type LovType = 'species' | 'plantedBy' | 'tag' | 'feature';

function sanitizeLovValue(type: LovType, value: string): string {
	const base = value.trim().replace(/\s+/g, ' ');
	if (!base) return '';

	if (type === 'tag') {
		const lowered = base.toLowerCase();
		return /^[a-z0-9]+$/.test(lowered) ? lowered : '';
	}

	if (type === 'feature') {
		return /^[A-Za-z0-9]+$/.test(base) ? base : '';
	}

	if (type === 'species' || type === 'plantedBy') {
		return /^[A-Za-z0-9 ]+$/.test(base) ? base : '';
	}

	return base;
}

function normalizeLovValue(value: string): string {
	return value.toLowerCase();
}

export async function recordLovValue(type: LovType, value: string | null | undefined): Promise<void> {
	const raw = value ? sanitizeLovValue(type, value) : '';
	if (!raw) return;

	const normalized = normalizeLovValue(raw);
	if (!normalized) return;

	await LovValueModel.updateOne(
		{ type, normalized },
		{
			$setOnInsert: {
				type,
				value: raw,
				normalized
			},
			$set: {
				lastUsedAt: new Date()
			},
			$inc: {
				usageCount: 1
			}
		},
		{ upsert: true }
	);
}

export async function recordApprovedTreeLovValues(tree: {
	species?: string | null;
	plantedBy?: string | null;
	tags?: string[] | null;
	features?: string[] | null;
}): Promise<void> {
	await Promise.all([
		recordLovValue('species', tree.species),
		recordLovValue('plantedBy', tree.plantedBy),
		...(tree.tags ?? []).map((tag) => recordLovValue('tag', tag)),
		...(tree.features ?? []).map((feature) => recordLovValue('feature', feature))
	]);
}

export async function getLovSuggestions(type: LovType, limit = 100): Promise<string[]> {
	const rows = await LovValueModel.find({ type })
		.sort({ usageCount: -1, lastUsedAt: -1, value: 1 })
		.limit(limit)
		.select({ value: 1, _id: 0 })
		.lean();

	return rows.map((row) => row.value).filter(Boolean);
}
