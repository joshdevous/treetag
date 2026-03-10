export interface LevelConfig {
	level: number;
	title: string;
	minPoints: number;
	colour: string;
	icon: string;
}

/** Fallback levels used if DB hasn't loaded yet */
export const DEFAULT_LEVELS: LevelConfig[] = [
	{ level: 1, title: 'Seedling', minPoints: 0, colour: 'stone', icon: 'Sprout' },
	{ level: 2, title: 'Sapling', minPoints: 50, colour: 'green', icon: 'Leaf' },
	{ level: 3, title: 'Trunk', minPoints: 200, colour: 'emerald', icon: 'TreePine' },
	{ level: 4, title: 'Canopy', minPoints: 500, colour: 'teal', icon: 'Trees' },
	{ level: 5, title: 'Ancient Oak', minPoints: 1000, colour: 'amber', icon: 'Award' }
];

export function getLevel(points: number, levels: LevelConfig[] = DEFAULT_LEVELS): LevelConfig {
	const sorted = [...levels].sort((a, b) => b.minPoints - a.minPoints);
	return sorted.find((l) => points >= l.minPoints) ?? sorted[sorted.length - 1];
}

export function getLevelProgress(points: number, levels: LevelConfig[] = DEFAULT_LEVELS) {
	const sorted = [...levels].sort((a, b) => a.minPoints - b.minPoints);
	const current = getLevel(points, sorted);
	const next = sorted.find((l) => l.minPoints > current.minPoints) ?? null;
	if (!next) return { current, next: null, progress: 1 };
	const progress = (points - current.minPoints) / (next.minPoints - current.minPoints);
	return { current, next, progress };
}

export const POINT_VALUES = {
	tag: 5,
	photo: 10,
	wildlife: 15,
	health_check: 20,
	disease: 25,
	note: 5,
	adopt: 50,
	daily_bonus: 5,
	streak_7day: 30
} as const;
