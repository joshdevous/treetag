import { connectDB } from '$lib/server/db';
import { LegalDocumentModel } from '$lib/server/db/models/legal-document';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	await connectDB();

	const doc = await LegalDocumentModel.findOne({ slug: params.slug }).lean();
	if (!doc) throw error(404, 'Document not found');

	return {
		document: {
			title: doc.title,
			subtitle: doc.subtitle,
			content: doc.content,
			lastUpdated: doc.lastUpdated.toISOString()
		}
	};
};
