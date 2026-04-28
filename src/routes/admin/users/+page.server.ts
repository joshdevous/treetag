import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { LevelModel } from '$lib/server/db/models/level';
import { DEFAULT_LEVELS, getLevel, type LevelConfig } from '$lib/levels';
import { MongoClient, ObjectId } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

const client = new MongoClient(DATABASE_URL);
const PER_PAGE = 25;
const ROLES = ['guardian', 'admin'] as const;
type Role = (typeof ROLES)[number];

export const load: PageServerLoad = async ({ url }) => {
	await connectDB();
	const db = client.db('treetag');

	const search = url.searchParams.get('q')?.trim() ?? '';
	const role = url.searchParams.get('role')?.trim() ?? '';
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));

	const filter: Record<string, any> = {};
	if (role && (ROLES as readonly string[]).includes(role)) {
		filter.role = role;
	}
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ username: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } }
		];
	}

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

	const [users, total] = await Promise.all([
		db
			.collection('user')
			.find(filter, {
				projection: { name: 1, username: 1, email: 1, role: 1, points: 1, avatar: 1, createdAt: 1, emailVerified: 1 }
			})
			.sort({ createdAt: -1 })
			.skip((pageNum - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.toArray(),
		db.collection('user').countDocuments(filter)
	]);

	const userIds = users.map((u) => u._id.toString());

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

	return {
		users: users.map((u) => {
			const id = u._id.toString();
			const points = (u.points as number) ?? 0;
			return {
				id,
				name: (u.name as string) ?? 'Guardian',
				username: (u.username as string) ?? '',
				email: (u.email as string) ?? '',
				role: ((u.role as string) ?? 'guardian') as Role,
				points,
				level: getLevel(points, levels),
				emailVerified: !!u.emailVerified,
				avatar: (u.avatar as string) ?? null,
				createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt ?? null,
				adoptedTrees: adoptionMap.get(id) ?? 0,
				observations: observationMap.get(id) ?? 0
			};
		}),
		filters: { search, role },
		page: pageNum,
		perPage: PER_PAGE,
		total,
		totalPages: Math.max(1, Math.ceil(total / PER_PAGE))
	};
};

export const actions: Actions = {
	setRole: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		const form = await request.formData();
		const userId = form.get('userId')?.toString();
		const role = form.get('role')?.toString() as Role;

		if (!userId) return fail(400, { error: 'User ID is required.' });
		if (!ObjectId.isValid(userId)) return fail(400, { error: 'Invalid user ID.' });
		if (!ROLES.includes(role)) return fail(400, { error: 'Invalid role.' });

		// Don't let an admin demote themselves (avoid lockout)
		if (userId === session.user.id && role !== 'admin') {
			return fail(400, { error: 'You cannot demote your own account.' });
		}

		const db = client.db('treetag');
		const result = await db
			.collection('user')
			.updateOne({ _id: new ObjectId(userId) }, { $set: { role } });

		if (result.matchedCount === 0) return fail(404, { error: 'User not found.' });

		return { success: `Role updated to ${role}.` };
	}
};
