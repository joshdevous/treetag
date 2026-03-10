import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL ?? 'mongodb://localhost:27017';

const treeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		species: { type: String, required: true },
		estimatedAge: Number,
		plantedDate: Date,
		plantedBy: String,
		height: Number,
		trunkDiameter: Number,
		location: {
			type: { type: String, enum: ['Point'], required: true },
			coordinates: { type: [Number], required: true },
			address: String
		},
		qrCodeId: { type: String, required: true, unique: true },
		photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
		adoptedBy: { type: String, default: null },
		adoptedAt: Date,
		tags: [String],
		features: [String],
		description: String,
		iNaturalistId: String,
		createdBy: { type: String, required: true }
	},
	{ timestamps: true, versionKey: false }
);

const TreeModel = mongoose.models['Tree'] ?? mongoose.model('Tree', treeSchema);

const SAMPLE_TREES = [
	{
		name: 'The Great Oak of London Road',
		species: 'English Oak',
		estimatedAge: 250,
		height: 28,
		trunkDiameter: 180,
		plantedBy: 'Unknown — pre-1800s',
		location: {
			type: 'Point' as const,
			coordinates: [-2.0536, 51.8826],
			address: 'London Road, Charlton Kings'
		},
		tags: ['heritage', 'healthy', 'landmark'],
		features: ['hollow trunk base', 'bird boxes', 'bench nearby'],
		description: 'A magnificent English Oak that has stood on London Road for centuries. One of the oldest trees in Charlton Kings, it provides vital habitat for local wildlife including nesting birds and insects.'
	},
	{
		name: 'Cirencester Road Lime',
		species: 'Common Lime',
		estimatedAge: 80,
		height: 22,
		trunkDiameter: 95,
		plantedDate: new Date('1945-05-08'),
		plantedBy: 'Charlton Kings Parish Council',
		location: {
			type: 'Point' as const,
			coordinates: [-2.0485, 51.8798],
			address: 'Cirencester Road, Charlton Kings'
		},
		tags: ['heritage', 'healthy'],
		features: ['avenue planting', 'fragrant flowers in summer'],
		description: 'Planted to commemorate VE Day in 1945, this Common Lime is part of a row of memorial trees along Cirencester Road. Its flowers attract bees and other pollinators every summer.'
	},
	{
		name: 'Holy Apostles Churchyard Yew',
		species: 'English Yew',
		estimatedAge: 400,
		height: 15,
		trunkDiameter: 220,
		location: {
			type: 'Point' as const,
			coordinates: [-2.0562, 51.8812],
			address: 'Holy Apostles Church, London Road, Charlton Kings'
		},
		tags: ['heritage', 'ancient', 'churchyard'],
		features: ['gnarled trunk', 'evergreen', 'historically significant'],
		description: 'An ancient English Yew in the churchyard of Holy Apostles. Yew trees in churchyards often predate the church itself — this specimen may be over 400 years old.'
	},
	{
		name: 'School Road Silver Birch',
		species: 'Silver Birch',
		estimatedAge: 35,
		height: 18,
		trunkDiameter: 40,
		plantedDate: new Date('1990-03-15'),
		plantedBy: 'Charlton Kings Primary School',
		location: {
			type: 'Point' as const,
			coordinates: [-2.0518, 51.8835],
			address: 'School Road, Charlton Kings'
		},
		tags: ['healthy', 'school'],
		features: ['white bark', 'autumn colour'],
		description: 'Planted by pupils of Charlton Kings Primary School in 1990. The distinctive white bark makes it a favourite with local children who pass it every day on their walk to school.'
	},
	{
		name: 'Sixways Copper Beech',
		species: 'Copper Beech',
		estimatedAge: 120,
		height: 25,
		trunkDiameter: 130,
		location: {
			type: 'Point' as const,
			coordinates: [-2.0505, 51.8842],
			address: 'Sixways, Charlton Kings'
		},
		tags: ['healthy', 'landmark', 'popular'],
		features: ['purple foliage', 'wide canopy', 'prominent position'],
		description: 'An imposing Copper Beech at the Sixways junction. Its deep purple leaves in spring and summer make it one of the most striking trees in the village, turning bronze-gold in autumn.'
	},
	{
		name: 'Battledown Horse Chestnut',
		species: 'Horse Chestnut',
		estimatedAge: 90,
		height: 20,
		trunkDiameter: 110,
		plantedDate: new Date('1935-01-01'),
		plantedBy: 'Battledown Estate',
		location: {
			type: 'Point' as const,
			coordinates: [-2.0440, 51.8865],
			address: 'Battledown Approach, Charlton Kings'
		},
		tags: ['concern', 'monitored'],
		features: ['conker tree', 'candle flowers in May', 'signs of leaf miner'],
		description: 'A grand Horse Chestnut on Battledown Approach. While still an impressive tree, it shows signs of horse chestnut leaf miner, a common pest affecting the species across the UK. Being monitored by local arborists.'
	},
	{
		name: 'Ham Hill Wild Cherry',
		species: 'Wild Cherry',
		estimatedAge: 45,
		height: 14,
		trunkDiameter: 55,
		plantedDate: new Date('1980-11-20'),
		plantedBy: 'Gloucestershire Wildlife Trust',
		location: {
			type: 'Point' as const,
			coordinates: [-2.0590, 51.8790],
			address: 'Ham Hill, Charlton Kings'
		},
		tags: ['healthy', 'wildlife'],
		features: ['spring blossom', 'cherries for birds', 'autumn colour'],
		description: 'A beautiful Wild Cherry planted by the Gloucestershire Wildlife Trust. In spring it erupts with white blossom, and its fruits in summer are a vital food source for birds including blackbirds and thrushes.'
	},
	{
		name: 'East End Park Willow',
		species: 'Weeping Willow',
		estimatedAge: 60,
		height: 16,
		trunkDiameter: 85,
		location: {
			type: 'Point' as const,
			coordinates: [-2.0465, 51.8815],
			address: 'East End Park, Charlton Kings'
		},
		tags: ['healthy', 'popular', 'park'],
		features: ['beside stream', 'trailing branches', 'picnic spot'],
		description: 'A classic Weeping Willow beside the stream in East End Park. Its trailing branches almost touch the water, creating a peaceful spot beloved by families and dog walkers alike.'
	},
	{
		name: 'Copt Elm Road Elm',
		species: 'Wych Elm',
		estimatedAge: 70,
		height: 24,
		trunkDiameter: 100,
		location: {
			type: 'Point' as const,
			coordinates: [-2.0550, 51.8850],
			address: 'Copt Elm Road, Charlton Kings'
		},
		tags: ['heritage', 'rare', 'monitored'],
		features: ['one of few surviving elms', 'large canopy'],
		description: 'A rare surviving Wych Elm on the road that bears its name. Most English elms were lost to Dutch Elm Disease in the 1970s — this Wych Elm has proved more resistant and stands as a living reminder of the village\'s arboreal history.'
	},
	{
		name: 'Ryeworth Road Scots Pine',
		species: 'Scots Pine',
		estimatedAge: 55,
		height: 20,
		trunkDiameter: 60,
		plantedDate: new Date('1970-04-22'),
		plantedBy: 'Charlton Kings Civic Society',
		location: {
			type: 'Point' as const,
			coordinates: [-2.0580, 51.8770],
			address: 'Ryeworth Road, Charlton Kings'
		},
		tags: ['healthy', 'evergreen'],
		features: ['red bark', 'blue-green needles', 'cones'],
		description: 'A Scots Pine planted on the first Earth Day in 1970 by the Charlton Kings Civic Society. Its distinctive orange-red bark in the upper trunk and blue-green needles make it easily identifiable year-round.'
	}
];

async function seed() {
	console.log('Connecting to database...');
	await mongoose.connect(DATABASE_URL, { dbName: 'treetag' });
	console.log('Connected.\n');

	// Use a placeholder createdBy — in production this would be an admin user ID
	const adminPlaceholder = 'seed-admin';

	let created = 0;
	let skipped = 0;

	for (const data of SAMPLE_TREES) {
		// Generate a unique qrCodeId from the tree name
		const qrCodeId = data.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 16);

		const existing = await TreeModel.findOne({ qrCodeId });
		if (existing) {
			console.log(`  ⏭ Skipped: ${data.name} (already exists)`);
			skipped++;
			continue;
		}

		await TreeModel.create({
			...data,
			qrCodeId,
			createdBy: adminPlaceholder
		});
		console.log(`  ✅ Created: ${data.name} (${data.species})`);
		created++;
	}

	console.log(`\nDone! Created ${created}, skipped ${skipped}.`);
	await mongoose.disconnect();
}

seed().catch((e) => {
	console.error('Seed failed:', e);
	process.exit(1);
});
