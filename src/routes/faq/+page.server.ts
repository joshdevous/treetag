import { connectDB } from '$lib/server/db';
import { FAQModel } from '$lib/server/db/models/faq';
import type { PageServerLoad } from './$types';

const CATEGORY_ORDER = ['general', 'tagging', 'adoption', 'points', 'tree-care'];

const CATEGORY_LABELS: Record<string, string> = {
	general: 'General',
	tagging: 'Tagging & Observations',
	adoption: 'Adoption',
	points: 'Points & Levels',
	'tree-care': 'Tree Care'
};

export const load: PageServerLoad = async () => {
	await connectDB();

	const all = await FAQModel.find().sort({ category: 1, order: 1 }).lean();

	const grouped = new Map<string, { question: string; answer: string; order: number }[]>();
	for (const f of all) {
		const list = grouped.get(f.category) ?? [];
		list.push({
			question: f.question,
			answer: f.answer,
			order: f.order ?? 0
		});
		grouped.set(f.category, list);
	}

	const known = CATEGORY_ORDER.map((slug) => ({
		slug,
		label: CATEGORY_LABELS[slug] ?? slug,
		entries: (grouped.get(slug) ?? []).sort((a, b) => a.order - b.order)
	}));

	const extras = [...grouped.keys()]
		.filter((slug) => !CATEGORY_ORDER.includes(slug))
		.map((slug) => ({
			slug,
			label: CATEGORY_LABELS[slug] ?? slug,
			entries: (grouped.get(slug) ?? []).sort((a, b) => a.order - b.order)
		}));

	const categories = [...known, ...extras].filter((c) => c.entries.length > 0);

	return { categories };
};
