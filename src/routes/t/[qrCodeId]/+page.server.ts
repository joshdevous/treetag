import { redirect } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	await connectDB();
	const tree = await TreeModel.findOne({ qrCodeId: params.qrCodeId }, { _id: 1 }).lean();
	if (!tree) throw redirect(303, '/trees');
	throw redirect(303, `/trees/${tree._id}`);
};
