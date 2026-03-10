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

	const [treeCount, adoptedCount, guardianCount, observationCount, recentTrees, recentActivity] =
		await Promise.all([
			TreeModel.countDocuments(),
			TreeModel.countDocuments({ adoptedBy: { $ne: null } }),
			db.collection('user').countDocuments(),
			ObservationModel.countDocuments(),
			TreeModel.find().sort({ updatedAt: -1 }).limit(6).lean(),
			ObservationModel.find()
				.sort({ createdAt: -1 })
				.limit(6)
				.populate('tree', 'name')
				.lean()
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
