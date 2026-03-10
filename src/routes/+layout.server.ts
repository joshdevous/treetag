import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { LevelModel } from '$lib/server/db/models/level';
import { DEFAULT_LEVELS, type LevelConfig } from '$lib/levels';
import type { LayoutServerLoad } from './$types';

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

	return {
		session: session?.session ?? null,
		user: session?.user ?? null,
		levels
	};
};
