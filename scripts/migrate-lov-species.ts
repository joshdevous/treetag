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

	if (rows.length === 0) {
		console.log('No approved tree species found to migrate.');
		await mongoose.disconnect();
		return;
	}

	console.log(`Found ${rows.length} distinct approved species to migrate.`);

	if (isDryRun) {
		for (const row of rows.slice(0, 20)) {
			console.log(`  ${row.value} (normalized: ${row._id}, usageCount: ${row.usageCount})`);
		}
		if (rows.length > 20) console.log(`  ...and ${rows.length - 20} more`);
		console.log('Dry run complete. No LOV records were written.');
		await mongoose.disconnect();
		return;
	}

	for (const row of rows) {
		await LovValueModel.updateOne(
			{ type: 'species', normalized: row._id },
			{
				$setOnInsert: {
					type: 'species',
					normalized: row._id
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

	console.log(`Migrated ${rows.length} species into lov_values.`);
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
