import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { LevelModel } from '$lib/server/db/models/level';
import { DEFAULT_LEVELS, type LevelConfig } from '$lib/levels';
import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

const client = new MongoClient(DATABASE_URL);

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	let levels: LevelConfig[];
	try {
		await connectDB();
		const dbLevels = await LevelModel.find().sort({ minPoints: 1 }).lean();
		levels = dbLevels.length > 0
			? dbLevels.map((l) => ({
					level: l.level,
					title: l.title,
					minPoints: l.minPoints,
					colour: l.colour,
					icon: l.icon
				}))
			: DEFAULT_LEVELS;
	} catch {
		levels = DEFAULT_LEVELS;
	}

	// Fetch avatar/banner from MongoDB (not stored in better-auth session)
	let avatar: string | null = null;
	let banner: string | null = null;
	if (session?.user) {
		try {
			const { ObjectId } = await import('mongodb');
			const db = client.db('treetag');
			const dbUser = await db.collection('user').findOne(
				{ _id: new ObjectId(session.user.id) },
				{ projection: { avatar: 1, banner: 1 } }
			);
			avatar = (dbUser?.avatar as string) ?? null;
			banner = (dbUser?.banner as string) ?? null;
		} catch {}
	}

	return {
		session: session?.session ?? null,
		user: session?.user ? { ...session.user, avatar, banner } : null,
		levels
	};
};
