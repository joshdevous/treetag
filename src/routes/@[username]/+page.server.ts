import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';

const client = new MongoClient(DATABASE_URL);

export const load: PageServerLoad = async ({ params, request }) => {
	const username = params.username;

	await connectDB();
	const db = client.db('treetag');

	const profileUser = await db.collection('user').findOne({ username });
	if (!profileUser) throw error(404, 'User not found');

	const session = await auth.api.getSession({ headers: request.headers });
	const isOwnProfile = session?.user?.id === profileUser._id.toString();

	const userId = profileUser._id.toString();

	const [adoptedTrees, observationCount, recentObservations] = await Promise.all([
		TreeModel.find({ adoptedBy: userId }).sort({ adoptedAt: -1 }).lean(),
		ObservationModel.countDocuments({ userId }),
		ObservationModel.find({ userId })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('tree', 'name')
			.lean()
	]);

	return {
		profileUser: {
			name: profileUser.name as string,
			username: profileUser.username as string,
			role: (profileUser.role as string) ?? 'guardian',
			points: (profileUser.points as number) ?? 0,
			createdAt: profileUser.createdAt?.toString() ?? null,
			avatar: (profileUser.avatar as string) ?? null,
			banner: (profileUser.banner as string) ?? null
		},
		isOwnProfile,
		adoptedTrees: adoptedTrees.map((t) => ({
			id: t._id?.toString(),
			name: t.name,
			species: t.species,
			adoptedAt: t.adoptedAt?.toISOString() ?? null
		})),
		observationCount,
		recentObservations: recentObservations.map((o) => ({
			id: o._id?.toString(),
			type: o.type,
			content: o.content ?? null,
			treeName: (o.tree as any)?.name ?? 'Unknown tree',
			createdAt: o.createdAt?.toISOString() ?? null
		}))
	};
};
