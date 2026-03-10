import type { LayoutServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';

const client = new MongoClient(DATABASE_URL);

export const load: LayoutServerLoad = async () => {
	await connectDB();

	const db = client.db('treetag');

	const [treeCount, adoptedCount, guardianCount, observationCount] = await Promise.all([
		TreeModel.countDocuments(),
		TreeModel.countDocuments({ adoptedBy: { $ne: null } }),
		db.collection('user').countDocuments(),
		ObservationModel.countDocuments()
	]);

	return {
		stats: {
			trees: treeCount,
			guardians: guardianCount,
			observations: observationCount,
			adopted: adoptedCount
		}
	};
};
