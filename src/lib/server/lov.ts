import { LovValueModel } from '$lib/server/db/models/lov-value';

type LovType = 'species' | 'plantedBy';

function normalizeLovValue(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function recordLovValue(type: LovType, value: string | null | undefined): Promise<void> {
	const raw = value?.trim();
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

export async function recordApprovedTreeLovValues(tree: { species?: string | null; plantedBy?: string | null }): Promise<void> {
	await Promise.all([
		recordLovValue('species', tree.species),
		recordLovValue('plantedBy', tree.plantedBy)
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
