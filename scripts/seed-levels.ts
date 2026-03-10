import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const levelSchema = new mongoose.Schema(
	{
		level: { type: Number, required: true, unique: true },
		title: { type: String, required: true },
		minPoints: { type: Number, required: true },
		colour: { type: String, required: true },
		icon: { type: String, required: true }
	},
	{ timestamps: true, versionKey: false }
);

const LevelModel = mongoose.model('Level', levelSchema);

const defaultLevels = [
	{ level: 1, title: 'Seedling', minPoints: 0, colour: 'stone', icon: 'Sprout' },
	{ level: 2, title: 'Sapling', minPoints: 50, colour: 'green', icon: 'Leaf' },
	{ level: 3, title: 'Trunk', minPoints: 200, colour: 'emerald', icon: 'TreePine' },
	{ level: 4, title: 'Canopy', minPoints: 500, colour: 'teal', icon: 'Trees' },
	{ level: 5, title: 'Ancient Oak', minPoints: 1000, colour: 'amber', icon: 'Award' }
];

async function seed() {
	await mongoose.connect(DATABASE_URL!, { dbName: 'treetag' });
	console.log('Connected to MongoDB');

	for (const lvl of defaultLevels) {
		await LevelModel.findOneAndUpdate({ level: lvl.level }, lvl, { upsert: true });
		console.log(`  Level ${lvl.level}: ${lvl.title} (${lvl.minPoints}pts) — ${lvl.icon} / ${lvl.colour}`);
	}

	console.log(`\nSeeded ${defaultLevels.length} levels.`);
	await mongoose.disconnect();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
