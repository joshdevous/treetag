import mongoose from 'mongoose';
import { LovValueModel } from '../src/lib/server/db/models/lov-value';

type LovType = 'species' | 'plantedBy' | 'tag' | 'feature';

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		console.error(`${name} environment variable is required`);
		process.exit(1);
	}
	return value;
}

function sanitizeForType(type: LovType, value: string): string {
	const base = value.trim().replace(/\s+/g, ' ');
	if (!base) return '';

	if (type === 'tag') {
		const lowered = base.toLowerCase();
		return /^[a-z0-9]+$/.test(lowered) ? lowered : '';
	}

	if (type === 'feature') {
		return /^[A-Za-z0-9 ]+$/.test(base) ? base : '';
	}

	return base;
}

function normalize(value: string): string {
	return value.toLowerCase().replace(/\s+/g, '_');
}

const DATABASE_URL = requireEnv('DATABASE_URL');

const mockLovSeed: Array<{ type: LovType; value: string }> = [
	{ type: 'plantedBy', value: 'Charlton Kings Parish Council' },
	{ type: 'tag', value: 'heritage' },
	{ type: 'tag', value: 'mature' },
	{ type: 'tag', value: 'shady' },
	{ type: 'tag', value: 'landmark' },
	{ type: 'feature', value: 'Wide Canopy' },
	{ type: 'feature', value: 'Buttress Roots' },
	{ type: 'feature', value: 'Carved Initials' },
	{ type: 'feature', value: 'Bird Nesting Site' }
];

async function seedLovMockData() {
	await mongoose.connect(DATABASE_URL, { dbName: 'treetag' });
	console.log('Connected to MongoDB');

	let upsertedCount = 0;
	for (const entry of mockLovSeed) {
		const cleanValue = sanitizeForType(entry.type, entry.value);
		if (!cleanValue) continue;

		const normalized = normalize(cleanValue);
		await LovValueModel.updateOne(
			{ type: entry.type, normalized },
			{
				$setOnInsert: {
					type: entry.type,
					value: cleanValue,
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
		upsertedCount++;
		console.log(`  seeded ${entry.type}: ${cleanValue}`);
	}

	console.log(`Seeded ${upsertedCount} mock LOV values.`);
	await mongoose.disconnect();
}

seedLovMockData().catch(async (err) => {
	console.error('Mock LOV seed failed:', err);
	try {
		await mongoose.disconnect();
	} catch {
		// ignore
	}
	process.exit(1);
});
