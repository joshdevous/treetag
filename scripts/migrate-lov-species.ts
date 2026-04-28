import mongoose from 'mongoose';
import { TreeModel } from '../src/lib/server/db/models/tree';
import { LovValueModel } from '../src/lib/server/db/models/lov-value';

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		console.error(`${name} environment variable is required`);
		process.exit(1);
	}
	return value;
}

const DATABASE_URL = requireEnv('DATABASE_URL');

const isDryRun = process.argv.includes('--dry-run');

function normalizeSpecies(value: string): string {
	return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function migrateSpeciesLov() {
	await mongoose.connect(DATABASE_URL, { dbName: 'treetag' });
	console.log('Connected to MongoDB');

	const rows = await TreeModel.aggregate<{
		_id: string;
		value: string;
		usageCount: number;
		lastUsedAt: Date;
	}>([
		{
			$match: {
				species: { $type: 'string', $ne: '' },
				$or: [{ status: 'approved' }, { status: null }]
			}
		},
		{
			$project: {
				value: { $trim: { input: '$species' } },
				updatedAt: 1
			}
		},
		{ $match: { value: { $ne: '' } } },
		{
			$project: {
				value: 1,
				normalized: { $toLower: '$value' },
				updatedAt: 1
			}
		},
		{
			$group: {
				_id: { normalized: '$normalized', value: '$value' },
				count: { $sum: 1 },
				lastUsedAt: { $max: '$updatedAt' }
			}
		},
		{ $sort: { '_id.normalized': 1, count: -1, lastUsedAt: -1 } },
		{
			$group: {
				_id: '$_id.normalized',
				value: { $first: '$_id.value' },
				usageCount: { $sum: '$count' },
				lastUsedAt: { $max: '$lastUsedAt' }
			}
		}
	]);

	console.log(`Found ${rows.length} distinct approved species from tree records.`);

	const now = new Date();
	const merged = new Map<string, { value: string; usageCount: number; lastUsedAt: Date }>();

	for (const species of TREE_SPECIES_SUGGESTIONS) {
		const normalized = normalizeSpecies(species);
		if (!normalized) continue;
		merged.set(normalized, {
			value: species,
			usageCount: 1,
			lastUsedAt: now
		});
	}

	for (const row of rows) {
		const normalized = normalizeSpecies(row._id);
		if (!normalized) continue;

		const existing = merged.get(normalized);
		if (!existing) {
			merged.set(normalized, {
				value: row.value,
				usageCount: row.usageCount,
				lastUsedAt: row.lastUsedAt ?? now
			});
			continue;
		}

		existing.usageCount += row.usageCount;
		if ((row.lastUsedAt ?? now) > existing.lastUsedAt) {
			existing.lastUsedAt = row.lastUsedAt ?? now;
		}
	}

	const finalRows = [...merged.entries()].map(([normalized, data]) => ({
		normalized,
		value: data.value,
		usageCount: data.usageCount,
		lastUsedAt: data.lastUsedAt
	}));

	if (finalRows.length === 0) {
		console.log('No species suggestions or approved tree species found to migrate.');
		await mongoose.disconnect();
		return;
	}

	console.log(`Prepared ${finalRows.length} distinct species to write to LOV.`);

	if (isDryRun) {
		for (const row of finalRows.slice(0, 20)) {
			console.log(`  ${row.value} (normalized: ${row.normalized}, usageCount: ${row.usageCount})`);
		}
		if (finalRows.length > 20) console.log(`  ...and ${finalRows.length - 20} more`);
		console.log('Dry run complete. No LOV records were written.');
		await mongoose.disconnect();
		return;
	}

	for (const row of finalRows) {
		await LovValueModel.updateOne(
			{ type: 'species', normalized: row.normalized },
			{
				$setOnInsert: {
					type: 'species',
					normalized: row.normalized
				},
				$set: {
					value: row.value,
					usageCount: row.usageCount,
					lastUsedAt: row.lastUsedAt ?? new Date()
				}
			},
			{ upsert: true }
		);
	}

	console.log(`Migrated ${finalRows.length} species into lov_values.`);
	await mongoose.disconnect();
}

migrateSpeciesLov().catch(async (err) => {
	console.error('Species LOV migration failed:', err);
	try {
		await mongoose.disconnect();
	} catch {
		// Ignore disconnect errors during failure handling.
	}
	process.exit(1);
});

export const TREE_SPECIES_SUGGESTIONS = [
	'Alder',
	'Ash',
	'Aspen',
	'Beech',
	'Birch',
	'Black Poplar',
	'Blackthorn',
	'Buckthorn',
	'Cherry',
	'Common Lime',
	'Crab Apple',
	'Elder',
	'Elm',
	'English Oak',
	'Field Maple',
	'Goat Willow',
	'Hawthorn',
	'Hazel',
	'Holly',
	'Hornbeam',
	'Horse Chestnut',
	'Larch',
	'Norway Maple',
	'Oak',
	'Pear',
	'Pedunculate Oak',
	'Plane',
	'Plum',
	'Poplar',
	'Rowan',
	'Silver Birch',
	'Small-leaved Lime',
	'Sweet Chestnut',
	'Sycamore',
	'Whitebeam',
	'Wild Cherry',
	'Willow',
	'Yew',
	'Acacia',
	'Apple',
	'Araucaria',
	'Atlas Cedar',
	'Bald Cypress',
	'Bay Laurel',
	'Box Elder',
	'Catalpa',
	'Cedar of Lebanon',
	'Chilean Pine',
	'Coast Redwood',
	'Cork Oak',
	'Copper Beech',
	'Dawn Redwood',
	'Dogwood',
	'Douglas Fir',
	'Downy Birch',
	'European Beech',
	'European Hornbeam',
	'False Acacia',
	'Fig',
	'Fringe Tree',
	'Giant Sequoia',
	'Ginkgo',
	'Golden Chain',
	'Grey Alder',
	'Grey Poplar',
	'Handkerchief Tree',
	'Italian Alder',
	'Italian Cypress',
	'Japanese Cherry',
	'Japanese Maple',
	'Judas Tree',
	'Kentucky Coffee Tree',
	'Korean Fir',
	'Laburnum',
	'Lawson Cypress',
	'Lime',
	'London Plane',
	'Magnolia',
	'Manna Ash',
	'Monkey Puzzle',
	'Mountain Ash',
	'Mulberry',
	'Norway Spruce',
	'Northern Red Oak',
	'Olive',
	'Oregon Grape',
	'Oriental Plane',
	'Paperbark Maple',
	'Persian Ironwood',
	'Pine',
	'Purple Leaf Plum',
	'Red Cedar',
	'Red Maple',
	'Red Oak',
	'Redbud',
	'Robinia',
	'Scotch Pine',
	'Serbian Spruce',
	'Service Tree',
	'Snowy Mespilus',
	'Spindle',
	'Spruce',
	'Stewartia',
	'Stone Pine',
	'Strawberry Tree',
	'Sugar Maple',
	'Swamp Cypress',
	'Sweet Gum',
	'Tamarisk',
	'Tulip Tree',
	'Turkish Hazel',
	'Weeping Willow',
	'Western Red Cedar',
	'White Mulberry',
	'White Poplar',
	'White Willow',
	'Wych Elm'
] as const;