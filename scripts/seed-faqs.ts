import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const faqSchema = new mongoose.Schema(
	{
		question: { type: String, required: true },
		answer: { type: String, required: true },
		category: { type: String, required: true },
		order: { type: Number, default: 0 }
	},
	{ timestamps: true, versionKey: false }
);

const FAQModel = mongoose.model('FAQ', faqSchema);

const faqs: { question: string; answer: string; category: string; order: number }[] = [
	// ------------------------------------------------------------------
	// General
	// ------------------------------------------------------------------
	{
		category: 'general',
		order: 1,
		question: 'What is Treetag?',
		answer:
			'Treetag is a community project for discovering, tagging, and caring for the trees of Charlton Kings. Each tree gets a QR code tag, making it easy to learn about and track the health of our local canopy.'
	},
	{
		category: 'general',
		order: 2,
		question: 'Is Treetag free to use?',
		answer:
			'Yes — Treetag is completely free. It is a community-driven project built to help residents engage with and protect the local tree canopy in Charlton Kings.'
	},
	{
		category: 'general',
		order: 3,
		question: 'Who is behind Treetag?',
		answer:
			'Treetag is run by Charlton Kings Tree Guardian, a community group dedicated to protecting and celebrating the area\'s street and public trees.'
	},
	{
		category: 'general',
		order: 4,
		question: 'Can I register a new tree?',
		answer:
			'Yes! Any registered user can submit a tree to the database. Your submission will be reviewed by an admin before appearing publicly on the map. Just create an account, click "Register a Tree", and fill in the details.'
	},

	// ------------------------------------------------------------------
	// Tagging & Observations
	// ------------------------------------------------------------------
	{
		category: 'tagging',
		order: 1,
		question: 'How do I scan a QR code?',
		answer:
			"Look for QR code tags on trees around Charlton Kings. Simply scan with your phone's camera or a QR reader app to instantly view the tree's profile, history, and observations."
	},
	{
		category: 'tagging',
		order: 2,
		question: 'What kinds of observations can I make?',
		answer:
			'You can tag a tree (a quick visit log), upload photos, report wildlife sightings, submit health checks, flag signs of disease, or leave free-form notes. Each type contributes differently to the community record and earns you points.'
	},
	{
		category: 'tagging',
		order: 3,
		question: 'Do I need an account to tag a tree?',
		answer:
			'Yes — you need a free account so we can credit your contributions, award you points, and build your profile. Browsing the map and viewing trees is open to everyone.'
	},
	{
		category: 'tagging',
		order: 4,
		question: 'What if I see something I\'m not sure how to classify?',
		answer:
			'Use the "Note" observation type to describe what you saw in your own words. An admin can follow up if needed.'
	},

	// ------------------------------------------------------------------
	// Adoption
	// ------------------------------------------------------------------
	{
		category: 'adoption',
		order: 1,
		question: 'How do I adopt a tree?',
		answer:
			"Create an account, explore the map or browse trees to find one you'd like to care for, and click the Adopt button on its page. Adopting a tree makes you its guardian and earns you 50 points straight away."
	},
	{
		category: 'adoption',
		order: 2,
		question: 'What does being a guardian involve?',
		answer:
			'There is no formal commitment — guardians are people who simply keep a closer eye on a tree they love. We encourage regular visits, photos through the seasons, and reporting any signs of poor health.'
	},
	{
		category: 'adoption',
		order: 3,
		question: 'Can I release a tree I have adopted?',
		answer:
			'Yes. Open the tree\'s page and click the "Release Tree" button in the adoption panel. The tree will become available for another guardian to adopt.'
	},
	{
		category: 'adoption',
		order: 4,
		question: 'Can more than one person adopt the same tree?',
		answer:
			'Each tree can only have one guardian at a time. However, anyone can still log observations, report wildlife, or share photos for any tree on the map.'
	},

	// ------------------------------------------------------------------
	// Points & Levels
	// ------------------------------------------------------------------
	{
		category: 'points',
		order: 1,
		question: 'How does the points system work?',
		answer:
			'Every interaction earns points — tagging a tree (5 pts), uploading a photo (10 pts), reporting wildlife (15 pts), health checks (20 pts), flagging disease (25 pts), leaving notes (5 pts), and adopting a tree (50 pts).'
	},
	{
		category: 'points',
		order: 2,
		question: 'What are the guardian levels?',
		answer:
			'As you earn points you progress through five levels: Seedling (0 pts), Sapling (50 pts), Trunk (200 pts), Canopy (500 pts), and Ancient Oak (1,000 pts). Each level unlocks a new badge on your profile.'
	},
	{
		category: 'points',
		order: 3,
		question: 'Where can I see my points and rank?',
		answer:
			'Your current points and level appear on your profile page. The Leaderboard ranks the top guardians across the whole project.'
	},

	// ------------------------------------------------------------------
	// Tree Care
	// ------------------------------------------------------------------
	{
		category: 'tree-care',
		order: 1,
		question: 'How can I tell if a tree is healthy?',
		answer:
			'Healthy trees have full, evenly-coloured leaves in season, smooth or characteristically textured bark without large wounds, and no obvious dead branches. Watch out for early leaf drop, fungus, oozing sap, or holes drilled by pests.'
	},
	{
		category: 'tree-care',
		order: 2,
		question: 'What should I do if I spot disease?',
		answer:
			'Submit a "Disease / damage" observation on the tree\'s page with a photo if you can. Our admins coordinate with local arborists to follow up on serious cases.'
	},
	{
		category: 'tree-care',
		order: 3,
		question: 'When should I water a young tree?',
		answer:
			'Newly planted trees usually need watering for their first two to three summers. A deep soak once a week is far better than a daily sprinkle. Mature trees rarely need watering except during prolonged droughts.'
	},
	{
		category: 'tree-care',
		order: 4,
		question: 'Can I prune a public tree?',
		answer:
			'No — public trees should only be pruned by the council or a qualified arborist. Please report any branches that look unsafe rather than touching them yourself.'
	}
];

async function seed() {
	await mongoose.connect(DATABASE_URL!, { dbName: 'treetag' });
	console.log('Connected to MongoDB');

	for (const faq of faqs) {
		await FAQModel.findOneAndUpdate(
			{ question: faq.question },
			faq,
			{ upsert: true }
		);
		console.log(`  [${faq.category}] ${faq.question}`);
	}

	console.log(`\nSeeded ${faqs.length} FAQ entries.`);
	await mongoose.disconnect();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
