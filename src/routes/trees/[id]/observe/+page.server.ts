import { error, fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { ObservationModel } from '$lib/server/db/models/observation';
import { PhotoModel } from '$lib/server/db/models/photo';
import { uploadPhoto } from '$lib/server/r2';
import { awardPoints } from '$lib/server/points';
import { POINT_VALUES } from '$lib/levels';
import type { PageServerLoad, Actions } from './$types';

const OBS_TYPES = ['tag', 'health_check', 'wildlife', 'disease', 'photo', 'note'] as const;
type ObsType = (typeof OBS_TYPES)[number];
const HEALTH_STATUSES = ['healthy', 'concern', 'diseased', 'dead'] as const;
const WILDLIFE_CATEGORIES = ['bird', 'insect', 'mammal', 'other'] as const;

export const load: PageServerLoad = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw redirect(303, `/auth/login?redirect=/trees/${params.id}/observe`);

	await connectDB();
	const tree = await TreeModel.findById(params.id).lean();
	if (!tree) throw error(404, 'Tree not found');

	const status = (tree as any).status ?? 'approved';
	const isAdmin = (session.user as any).role === 'admin';
	const isOwner = session.user.id === tree.createdBy;
	if (status !== 'approved' && !isAdmin && !isOwner) throw error(404, 'Tree not found');

	return {
		tree: {
			id: tree._id.toString(),
			name: tree.name,
			species: tree.species
		}
	};
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });

		await connectDB();
		const tree = await TreeModel.findById(params.id);
		if (!tree) return fail(404, { error: 'Tree not found' });
		if ((tree as any).status && (tree as any).status !== 'approved') {
			return fail(400, { error: 'You can only observe approved trees.' });
		}

		const form = await request.formData();
		const rawType = form.get('type')?.toString().trim() ?? 'tag';
		if (!OBS_TYPES.includes(rawType as ObsType)) {
			return fail(400, { error: 'Invalid observation type.', field: 'type' });
		}
		const type = rawType as ObsType;

		const content = form.get('content')?.toString().trim() ?? '';
		if (content.length > 2000) {
			return fail(400, { error: 'Note must be 2,000 characters or less.', field: 'content' });
		}
		if (type === 'note' && !content) {
			return fail(400, { error: 'A note observation needs some text.', field: 'content' });
		}

		// Health status — only used for health_check / disease
		let healthStatus: string | undefined;
		if (type === 'health_check' || type === 'disease') {
			const raw = form.get('healthStatus')?.toString().trim();
			if (raw) {
				if (!HEALTH_STATUSES.includes(raw as (typeof HEALTH_STATUSES)[number])) {
					return fail(400, { error: 'Invalid health status.', field: 'healthStatus' });
				}
				healthStatus = raw;
			} else if (type === 'disease') {
				healthStatus = 'diseased';
			}
		}

		// Wildlife — only used for wildlife type
		let wildlife: { species: string; category: string } | undefined;
		if (type === 'wildlife') {
			const species = form.get('wildlifeSpecies')?.toString().trim() ?? '';
			const category = form.get('wildlifeCategory')?.toString().trim() ?? '';
			if (!species) return fail(400, { error: 'Wildlife species is required.', field: 'wildlifeSpecies' });
			if (species.length > 100) return fail(400, { error: 'Species must be 100 characters or less.', field: 'wildlifeSpecies' });
			if (!WILDLIFE_CATEGORIES.includes(category as (typeof WILDLIFE_CATEGORIES)[number])) {
				return fail(400, { error: 'Choose a wildlife category.', field: 'wildlifeCategory' });
			}
			wildlife = { species, category };
		}

		// Photos — required for photo type
		const photos = form.getAll('photos') as File[];
		const validPhotos = photos.filter((f) => f.size > 0);
		if (validPhotos.length > 5) return fail(400, { error: 'You can attach up to 5 photos.', field: 'photos' });
		if (type === 'photo' && validPhotos.length === 0) {
			return fail(400, { error: 'A photo observation needs at least one photo.', field: 'photos' });
		}
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		const maxSize = 10 * 1024 * 1024;
		for (const file of validPhotos) {
			if (!allowedTypes.includes(file.type)) {
				return fail(400, { error: `Invalid file type: ${file.name}.`, field: 'photos' });
			}
			if (file.size > maxSize) {
				return fail(400, { error: `${file.name} exceeds the 10 MB limit.`, field: 'photos' });
			}
		}

		// Upload photos to R2 + create Photo docs
		const photoIds: string[] = [];
		for (const file of validPhotos) {
			try {
				const result = await uploadPhoto(file, 'observations');
				const photo = await PhotoModel.create({
					url: result.url,
					key: result.key,
					uploadedBy: session.user.id,
					tree: tree._id
				});
				photoIds.push(photo._id.toString());
			} catch {
				// skip failed uploads
			}
		}

		const pointsAwarded = POINT_VALUES[type] ?? 0;

		try {
			const observation = await ObservationModel.create({
				tree: tree._id,
				userId: session.user.id,
				type,
				content: content || undefined,
				photos: photoIds,
				wildlife,
				healthStatus,
				pointsAwarded
			});

			if (photoIds.length > 0) {
				await PhotoModel.updateMany(
					{ _id: { $in: photoIds } },
					{ $set: { observation: observation._id } }
				);
			}

			if (pointsAwarded > 0) {
				await awardPoints(session.user.id, pointsAwarded);
			}
		} catch (e: any) {
			return fail(500, { error: e.message ?? 'Failed to save observation.' });
		}

		throw redirect(303, `/trees/${params.id}`);
	}
};
