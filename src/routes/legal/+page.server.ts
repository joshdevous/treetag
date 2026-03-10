import { connectDB } from '$lib/server/db';
import { LegalDocumentModel } from '$lib/server/db/models/legal-document';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	await connectDB();

	const docs = await LegalDocumentModel.find({}, {
		slug: 1,
		title: 1,
		description: 1,
		icon: 1,
		lastUpdated: 1,
		_id: 0
	})
		.sort({ slug: 1 })
		.lean();

	return {
		documents: docs.map((doc) => ({
			slug: doc.slug,
			title: doc.title,
			description: doc.description,
			icon: doc.icon,
			lastUpdated: doc.lastUpdated.toISOString()
		}))
	};
};
