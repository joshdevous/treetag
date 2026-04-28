import { error, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { PhotoModel } from '$lib/server/db/models/photo';
import { recordApprovedTreeLovValues } from '$lib/server/lov';
import { awardPoints } from '$lib/server/points';
import { POINT_VALUES } from '$lib/levels';
import { MongoClient, ObjectId } from 'mongodb';
import { DATABASE_URL, APP_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

const client = new MongoClient(DATABASE_URL);

export const load: PageServerLoad = async ({ params, request }) => {
	await connectDB();

	const tree = await TreeModel.findById(params.id).populate('photos').lean();
	if (!tree) throw error(404, 'Tree not found');

	const session = await auth.api.getSession({ headers: request.headers });
	const isAdmin = (session?.user as any)?.role === 'admin';
	const isOwner = session?.user?.id === tree.createdBy;
	const status = (tree as any).status ?? 'approved';

	// Pending/rejected trees are only visible to admins and the submitter
	if (status !== 'approved' && !isAdmin && !isOwner) {
		throw error(404, 'Tree not found');
	}

	const db = client.db('treetag');

	// Fetch observations with user names
	const observations = await ObservationModel.find({ tree: tree._id })
		.sort({ createdAt: -1 })
		.limit(20)
		.populate('photos')
		.lean();

	const userIds = [...new Set([
		tree.createdBy,
		tree.adoptedBy,
		...observations.map((o) => o.userId)
	].filter(Boolean))];

	const userObjectIds = userIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
	const users = userObjectIds.length
		? await db.collection('user')
			.find({ _id: { $in: userObjectIds } })
			.project({ name: 1, username: 1, avatar: 1 })
			.toArray()
		: [];
	const userMap = new Map(users.map((u) => [u._id.toString(), { name: u.name as string, username: u.username as string, avatar: (u.avatar as string) ?? null }]));

	const isLoggedIn = !!session?.user;

	return {
		tree: {
			id: tree._id.toString(),
			name: tree.name,
			species: tree.species,
			estimatedAge: tree.estimatedAge ?? null,
			plantedDate: tree.plantedDate?.toISOString() ?? null,
			plantedBy: tree.plantedBy ?? null,
			height: tree.height ?? null,
			trunkDiameter: tree.trunkDiameter ?? null,
			location: {
				coordinates: tree.location.coordinates,
				address: tree.location.address ?? null
			},
			qrCodeId: tree.qrCodeId,
			photos: (tree.photos as any[]).map((p) => ({
				id: p._id.toString(),
				url: p.url,
				caption: p.caption ?? null
			})),
			adoptedBy: tree.adoptedBy
				? { id: tree.adoptedBy, ...(userMap.get(tree.adoptedBy) ?? { name: 'Unknown', username: 'unknown', avatar: null }) }
				: null,
			adoptedAt: tree.adoptedAt?.toISOString() ?? null,
			tags: tree.tags ?? [],
			features: tree.features ?? [],
			description: tree.description ?? null,
			status,
			createdBy: { id: tree.createdBy, ...(userMap.get(tree.createdBy) ?? { name: 'Unknown', username: 'unknown', avatar: null }) },
			createdAt: tree.createdAt?.toISOString() ?? null,
			updatedAt: tree.updatedAt?.toISOString() ?? null
		},
		observations: observations.map((o) => {
			const user = userMap.get(o.userId);
			return {
				id: o._id.toString(),
				type: o.type,
				content: o.content ?? null,
				photos: ((o.photos ?? []) as any[]).map((p) => ({
					id: p._id.toString(),
					url: p.url,
					caption: p.caption ?? null
				})),
				wildlife: o.wildlife ?? null,
				healthStatus: o.healthStatus ?? null,
				pointsAwarded: o.pointsAwarded ?? 0,
				user: user ? { name: user.name, username: user.username, avatar: user.avatar } : { name: 'Unknown', username: 'unknown', avatar: null },
				createdAt: o.createdAt?.toISOString() ?? null
			};
		}),
		isAdmin,
		isLoggedIn,
		userId: session?.user?.id ?? null,
		appUrl: APP_URL ?? 'http://localhost:5173'
	};
};

export const actions: Actions = {
	approve: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		await connectDB();
		const tree = await TreeModel.findById(params.id);
		if (!tree) return fail(404, { error: 'Tree not found' });

		tree.status = 'approved';
		await tree.save();
		await recordApprovedTreeLovValues({
			species: tree.species,
			plantedBy: tree.plantedBy ?? null,
			tags: tree.tags ?? [],
			features: tree.features ?? []
		});

		return { success: 'Tree approved and now visible to the public.' };
	},

	reject: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });
		if ((session.user as any).role !== 'admin') return fail(403, { error: 'Not authorised' });

		await connectDB();
		const tree = await TreeModel.findById(params.id);
		if (!tree) return fail(404, { error: 'Tree not found' });

		tree.status = 'rejected';
		await tree.save();

		return { success: 'Tree submission has been rejected.' };
	},

	adopt: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });

		await connectDB();
		const tree = await TreeModel.findById(params.id);
		if (!tree) return fail(404, { error: 'Tree not found' });
		if ((tree as any).status && (tree as any).status !== 'approved') {
			return fail(400, { error: 'Only approved trees can be adopted.' });
		}
		if (tree.adoptedBy) {
			return fail(400, {
				error: tree.adoptedBy === session.user.id
					? 'You already adopted this tree.'
					: 'This tree already has a guardian.'
			});
		}

		tree.adoptedBy = session.user.id;
		tree.adoptedAt = new Date();
		await tree.save();

		await awardPoints(session.user.id, POINT_VALUES.adopt);

		return { success: `You adopted ${tree.name}! +${POINT_VALUES.adopt} points.` };
	},

	unadopt: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });

		await connectDB();
		const tree = await TreeModel.findById(params.id);
		if (!tree) return fail(404, { error: 'Tree not found' });

		const isAdmin = (session.user as any).role === 'admin';
		if (tree.adoptedBy !== session.user.id && !isAdmin) {
			return fail(403, { error: 'Only the current guardian can release this tree.' });
		}

		tree.adoptedBy = null;
		tree.adoptedAt = undefined;
		await tree.save();

		return { success: 'You released this tree. Another guardian can adopt it.' };
	}
};
