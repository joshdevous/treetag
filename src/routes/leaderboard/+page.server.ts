import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { LevelModel } from '$lib/server/db/models/level';
import { DEFAULT_LEVELS, getLevel, type LevelConfig } from '$lib/levels';
import { auth } from '$lib/server/auth';
import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

const client = new MongoClient(DATABASE_URL);

const PER_PAGE = 25;

export const load: PageServerLoad = async ({ url, request }) => {
	await connectDB();
	const db = client.db('treetag');

	const session = await auth.api.getSession({ headers: request.headers });
	const currentUserId = session?.user?.id ?? null;

	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));

	let levels: LevelConfig[] = DEFAULT_LEVELS;
	try {
		const dbLevels = await LevelModel.find().sort({ minPoints: 1 }).lean();
		if (dbLevels.length > 0) {
			levels = dbLevels.map((l) => ({
				level: l.level,
				title: l.title,
				minPoints: l.minPoints,
				colour: l.colour,
				icon: l.icon
			}));
		}
	} catch {}

	const total = await db.collection('user').countDocuments({ points: { $gt: 0 } });

	const users = await db
		.collection('user')
		.find({}, { projection: { name: 1, username: 1, avatar: 1, points: 1 } })
		.sort({ points: -1, createdAt: 1 })
		.skip((pageNum - 1) * PER_PAGE)
		.limit(PER_PAGE)
		.toArray();

	const userIds = users.map((u) => u._id.toString());

	// Tally adopted trees and observations per user (only for the current page)
	const [adoptionCounts, observationCounts] = await Promise.all([
		userIds.length
			? TreeModel.aggregate([
					{ $match: { adoptedBy: { $in: userIds } } },
					{ $group: { _id: '$adoptedBy', count: { $sum: 1 } } }
				])
			: Promise.resolve([]),
		userIds.length
			? ObservationModel.aggregate([
					{ $match: { userId: { $in: userIds } } },
					{ $group: { _id: '$userId', count: { $sum: 1 } } }
				])
			: Promise.resolve([])
	]);

	const adoptionMap = new Map(adoptionCounts.map((r: any) => [r._id, r.count]));
	const observationMap = new Map(observationCounts.map((r: any) => [r._id, r.count]));

	const startRank = (pageNum - 1) * PER_PAGE + 1;

	const entries = users.map((u, i) => {
		const id = u._id.toString();
		const points = (u.points as number) ?? 0;
		const level = getLevel(points, levels);
		return {
			id,
			rank: startRank + i,
			name: (u.name as string) ?? 'Guardian',
			username: (u.username as string) ?? '',
			avatar: (u.avatar as string) ?? null,
			points,
			level,
			adoptedTrees: adoptionMap.get(id) ?? 0,
			observations: observationMap.get(id) ?? 0,
			isCurrentUser: id === currentUserId
		};
	});

	return {
		entries,
		page: pageNum,
		perPage: PER_PAGE,
		total,
		totalPages: Math.max(1, Math.ceil(total / PER_PAGE))
	};
};
