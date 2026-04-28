import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { MongoClient, ObjectId } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';

const client = new MongoClient(DATABASE_URL);

export const load: PageServerLoad = async () => {
	await connectDB();
	const db = client.db('treetag');

	const approvedFilter = { status: { $in: ['approved', null] } };

	const [treeCount, adoptedCount, guardianCount, observationCount, recentTrees, recentActivity, mapTrees] =
		await Promise.all([
			TreeModel.countDocuments(approvedFilter),
			TreeModel.countDocuments({ ...approvedFilter, adoptedBy: { $ne: null } }),
			db.collection('user').countDocuments(),
			ObservationModel.countDocuments(),
			TreeModel.find(approvedFilter).sort({ updatedAt: -1 }).limit(6).lean(),
			ObservationModel.find()
				.sort({ createdAt: -1 })
				.limit(6)
				.populate('tree', 'name')
				.lean(),
			TreeModel.find(approvedFilter, { name: 1, species: 1, location: 1, adoptedBy: 1 }).lean()
		]);

	const userIds = [...new Set(recentActivity.map((a) => a.userId).filter(Boolean))];
	const userObjectIds = userIds
		.filter((id): id is string => typeof id === 'string' && ObjectId.isValid(id))
		.map((id) => new ObjectId(id));
	const users = userObjectIds.length
		? await db
				.collection('user')
				.find({ _id: { $in: userObjectIds } })
				.project({ _id: 1, name: 1 })
				.toArray()
		: [];
	const userMap = new Map(users.map((u) => [String(u._id), u.name as string]));

	return {
		stats: {
			trees: treeCount,
			guardians: guardianCount,
			observations: observationCount,
			adopted: adoptedCount
		},
		recentTrees: recentTrees.map((t) => ({
			id: String(t._id),
			name: t.name,
			species: t.species,
			age: t.estimatedAge ?? null,
			tags: t.tags ?? [],
			adopted: t.adoptedBy != null,
			location: t.location?.address ?? ''
		})),
		mapTrees: mapTrees
			.filter((t) => t.location?.coordinates?.[0] && t.location?.coordinates?.[1])
			.map((t) => ({
				id: String(t._id),
				name: t.name,
				species: t.species,
				lat: t.location.coordinates[1],
				lng: t.location.coordinates[0],
				adopted: t.adoptedBy != null
			})),
		activity: recentActivity.map((a) => {
			const tree = a.tree as unknown as { _id: unknown; name: string } | null;
			return {
				id: String(a._id),
				userName: userMap.get(a.userId) ?? 'Unknown',
				type: a.type as string,
				treeId: tree?._id ? String(tree._id) : null,
				treeName: tree?.name ?? 'Unknown Tree',
				content: (a.content as string | undefined) ?? null,
				wildlifeSpecies: (a as any).wildlife?.species ?? null,
				healthStatus: (a as any).healthStatus ?? null,
				createdAt: new Date((a as any).createdAt ?? Date.now()).toISOString()
			};
		})
	};
};
