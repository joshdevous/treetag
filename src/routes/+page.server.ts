import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { MongoClient } from 'mongodb';
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

	const userIds = [...new Set(recentActivity.map((a) => a.userId))];
	const users = userIds.length
		? await db
				.collection('user')
				.find({ id: { $in: userIds } })
				.project({ id: 1, name: 1 })
				.toArray()
		: [];
	const userMap = new Map(users.map((u) => [u.id, u.name as string]));

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
			const tree = a.tree as unknown as { name: string } | null;
			return {
				id: String(a._id),
				userName: userMap.get(a.userId) ?? 'Unknown',
				type: a.type as string,
				treeName: tree?.name ?? 'Unknown Tree',
				createdAt: new Date((a as any).createdAt ?? Date.now()).toISOString()
			};
		})
	};
};
