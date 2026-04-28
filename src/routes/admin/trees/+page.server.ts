import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { PhotoModel } from '$lib/server/db/models/photo';
import { deletePhoto } from '$lib/server/r2';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	await connectDB();

	const search = url.searchParams.get('q')?.trim() ?? '';
	const status = url.searchParams.get('status')?.trim() ?? '';
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const perPage = 25;

	const filter: Record<string, any> = {};
	if (status && ['pending', 'approved', 'rejected'].includes(status)) {
		filter.status = status;
	}
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ species: { $regex: search, $options: 'i' } },
			{ 'location.address': { $regex: search, $options: 'i' } }
		];
	}

	const [trees, total] = await Promise.all([
		TreeModel.find(filter)
			.sort({ createdAt: -1 })
			.skip((pageNum - 1) * perPage)
			.limit(perPage)
			.lean(),
		TreeModel.countDocuments(filter)
	]);

	return {
		trees: trees.map((t) => ({
			id: t._id.toString(),
			name: t.name,
			species: t.species,
			status: (t as any).status ?? 'approved',
			adopted: t.adoptedBy != null,
			photoCount: (t.photos ?? []).length,
			location: t.location?.address ?? '',
			createdAt: t.createdAt?.toISOString() ?? null
		})),
		filters: { search, status },
		page: pageNum,
		perPage,
		total,
		totalPages: Math.ceil(total / perPage)
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		const form = await request.formData();
		const treeId = form.get('treeId')?.toString();
		if (!treeId) return fail(400, { error: 'Tree ID is required.' });

		await connectDB();
		const tree = await TreeModel.findById(treeId);
		if (!tree) return fail(404, { error: 'Tree not found.' });

		// Cascade: collect every photo attached to the tree or any of its observations
		const observations = await ObservationModel.find({ tree: tree._id }).lean();
		const observationIds = observations.map((o) => o._id);
		const photos = await PhotoModel.find({
			$or: [{ tree: tree._id }, { observation: { $in: observationIds } }]
		}).lean();

		// Best-effort R2 delete (failures shouldn't block the DB cleanup)
		await Promise.allSettled(photos.map((p) => deletePhoto((p as any).key)));

		await Promise.all([
			PhotoModel.deleteMany({ _id: { $in: photos.map((p) => p._id) } }),
			ObservationModel.deleteMany({ tree: tree._id }),
			TreeModel.deleteOne({ _id: tree._id })
		]);

		return {
			success: `Deleted "${tree.name}" along with ${observations.length} observation(s) and ${photos.length} photo(s).`
		};
	}
};
