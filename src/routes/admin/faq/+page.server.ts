import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { FAQModel } from '$lib/server/db/models/faq';
import { Types } from 'mongoose';
import type { PageServerLoad, Actions } from './$types';

const KNOWN_CATEGORIES = ['general', 'tagging', 'adoption', 'points', 'tree-care'] as const;

const CATEGORY_LABELS: Record<string, string> = {
	general: 'General',
	tagging: 'Tagging & Observations',
	adoption: 'Adoption',
	points: 'Points & Levels',
	'tree-care': 'Tree Care'
};

function categoryLabel(slug: string) {
	return CATEGORY_LABELS[slug] ?? slug;
}

export const load: PageServerLoad = async () => {
	await connectDB();
	const all = await FAQModel.find().sort({ category: 1, order: 1 }).lean();

	const grouped = new Map<string, { id: string; question: string; answer: string; order: number }[]>();
	for (const f of all) {
		const list = grouped.get(f.category) ?? [];
		list.push({
			id: f._id.toString(),
			question: f.question,
			answer: f.answer,
			order: f.order ?? 0
		});
		grouped.set(f.category, list);
	}

	const known = KNOWN_CATEGORIES.map((slug) => ({
		slug,
		label: categoryLabel(slug),
		entries: (grouped.get(slug) ?? []).sort((a, b) => a.order - b.order)
	}));

	const extras = [...grouped.keys()]
		.filter((slug) => !KNOWN_CATEGORIES.includes(slug as any))
		.map((slug) => ({
			slug,
			label: categoryLabel(slug),
			entries: (grouped.get(slug) ?? []).sort((a, b) => a.order - b.order)
		}));

	return {
		categories: [...known, ...extras],
		categoryOptions: [...KNOWN_CATEGORIES.map((slug) => ({ slug, label: categoryLabel(slug) }))]
	};
};

function validateCommon(form: FormData) {
	const question = form.get('question')?.toString().trim() ?? '';
	const answer = form.get('answer')?.toString().trim() ?? '';
	const category = form.get('category')?.toString().trim() ?? '';
	const orderRaw = form.get('order')?.toString().trim() ?? '';

	if (!question) return { error: 'Question is required.', field: 'question' };
	if (question.length > 300) return { error: 'Question must be 300 characters or less.', field: 'question' };
	if (!answer) return { error: 'Answer is required.', field: 'answer' };
	if (answer.length > 4000) return { error: 'Answer must be 4,000 characters or less.', field: 'answer' };
	if (!category || !/^[a-z0-9-]+$/.test(category)) {
		return { error: 'Category must be lowercase letters, numbers and dashes only.', field: 'category' };
	}
	if (category.length > 50) return { error: 'Category must be 50 characters or less.', field: 'category' };

	const order = orderRaw ? parseInt(orderRaw, 10) : 0;
	if (Number.isNaN(order) || order < 0 || order > 9999) {
		return { error: 'Order must be a number between 0 and 9999.', field: 'order' };
	}
	return { question, answer, category, order };
}

export const actions: Actions = {
	create: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		const form = await request.formData();
		const result = validateCommon(form);
		if ('error' in result) return fail(400, result);

		await connectDB();
		await FAQModel.create(result);
		return { success: `Created "${result.question}".` };
	},

	update: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		const form = await request.formData();
		const id = form.get('id')?.toString() ?? '';
		if (!Types.ObjectId.isValid(id)) return fail(400, { error: 'Invalid FAQ ID.' });

		const result = validateCommon(form);
		if ('error' in result) return fail(400, result);

		await connectDB();
		const updated = await FAQModel.findByIdAndUpdate(id, result, { new: true });
		if (!updated) return fail(404, { error: 'FAQ not found.' });

		return { success: `Updated "${result.question}".` };
	},

	delete: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		const form = await request.formData();
		const id = form.get('id')?.toString() ?? '';
		if (!Types.ObjectId.isValid(id)) return fail(400, { error: 'Invalid FAQ ID.' });

		await connectDB();
		const deleted = await FAQModel.findByIdAndDelete(id);
		if (!deleted) return fail(404, { error: 'FAQ not found.' });

		return { success: 'FAQ deleted.' };
	}
};
