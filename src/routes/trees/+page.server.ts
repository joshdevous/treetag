import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { PhotoModel } from '$lib/server/db/models/photo';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	await connectDB();

	const session = await auth.api.getSession({ headers: request.headers });
	const isAdmin = (session?.user as any)?.role === 'admin';

	const search = url.searchParams.get('q')?.trim() ?? '';
	const species = url.searchParams.get('species')?.trim() ?? '';
	const sort = url.searchParams.get('sort') ?? 'newest';
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const perPage = 12;

	// Build filter
	const filter: Record<string, any> = {};
	// Only admins see all trees; everyone else sees only approved
	if (!isAdmin) {
		filter.status = { $in: ['approved', null] };
	}
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ species: { $regex: search, $options: 'i' } },
			{ 'location.address': { $regex: search, $options: 'i' } },
			{ tags: { $regex: search, $options: 'i' } }
		];
	}
	if (species) {
		filter.species = { $regex: `^${species.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
	}

	// Sort
	let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
	if (sort === 'oldest') sortObj = { createdAt: 1 };
	if (sort === 'name') sortObj = { name: 1 };
	if (sort === 'species') sortObj = { species: 1 };

	const [trees, total, allSpecies] = await Promise.all([
		TreeModel.find(filter)
			.sort(sortObj)
			.skip((pageNum - 1) * perPage)
			.limit(perPage)
			.populate('photos')
			.lean(),
		TreeModel.countDocuments(filter),
		TreeModel.distinct('species', isAdmin ? {} : { status: 'approved' })
	]);

	return {
		trees: trees.map((t) => {
			const photos = (t.photos ?? []) as any[];
			return {
				id: t._id.toString(),
				name: t.name,
				species: t.species,
				age: t.estimatedAge ?? null,
				location: t.location?.address ?? '',
				lat: t.location?.coordinates?.[1] ?? null,
				lng: t.location?.coordinates?.[0] ?? null,
				tags: t.tags ?? [],
				adopted: t.adoptedBy != null,
				photoUrl: photos[0]?.url ?? null,
				status: (t as any).status ?? 'approved'
			};
		}),
		total,
		page: pageNum,
		perPage,
		totalPages: Math.ceil(total / perPage),
		allSpecies: allSpecies.sort(),
		filters: { search, species, sort }
	};
};
