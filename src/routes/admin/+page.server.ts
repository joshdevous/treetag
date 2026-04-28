import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { PhotoModel } from '$lib/server/db/models/photo';
import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

const client = new MongoClient(DATABASE_URL);

export const load: PageServerLoad = async () => {
	await connectDB();
	const db = client.db('treetag');

	const [
		totalTrees,
		approvedTrees,
		pendingTrees,
		rejectedTrees,
		adoptedTrees,
		totalObservations,
		totalPhotos,
		totalUsers,
		recentTrees,
		recentObservations
	] = await Promise.all([
		TreeModel.countDocuments(),
		TreeModel.countDocuments({ status: 'approved' }),
		TreeModel.countDocuments({ status: 'pending' }),
		TreeModel.countDocuments({ status: 'rejected' }),
		TreeModel.countDocuments({ adoptedBy: { $ne: null } }),
		ObservationModel.countDocuments(),
		PhotoModel.countDocuments(),
		db.collection('user').countDocuments(),
		TreeModel.find().sort({ createdAt: -1 }).limit(5).lean(),
		ObservationModel.find().sort({ createdAt: -1 }).limit(5).lean()
	]);

	return {
		stats: {
			totalTrees,
			approvedTrees,
			pendingTrees,
			rejectedTrees,
			adoptedTrees,
			totalObservations,
			totalPhotos,
			totalUsers
		},
		recentTrees: recentTrees.map((t) => ({
			id: t._id.toString(),
			name: t.name,
			species: t.species,
			status: (t as any).status ?? 'approved',
			createdAt: t.createdAt?.toISOString() ?? null
		})),
		recentObservations: recentObservations.map((o) => ({
			id: o._id.toString(),
			tree: o.tree?.toString() ?? null,
			type: o.type,
			pointsAwarded: o.pointsAwarded ?? 0,
			createdAt: o.createdAt?.toISOString() ?? null
		}))
	};
};
