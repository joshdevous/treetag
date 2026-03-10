import { redirect, fail, error } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { PhotoModel } from '$lib/server/db/models/photo';
import { uploadPhoto, deletePhoto } from '$lib/server/r2';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw redirect(303, '/auth/login');

	const isAdmin = (session.user as any).role === 'admin';

	await connectDB();
	const treeDoc = await TreeModel.findById(params.id).lean();
	if (!treeDoc) throw error(404, 'Tree not found');

	const isOwner = session.user.id === treeDoc.createdBy;
	const treeStatus = (treeDoc as any).status ?? 'approved';

	// Admins can edit any tree; owners can edit their own pending trees
	if (!isAdmin && !(isOwner && treeStatus === 'pending')) throw redirect(303, `/trees/${params.id}`);

	const tree = await TreeModel.findById(params.id).populate('photos').lean();
	if (!tree) throw error(404, 'Tree not found');

	return {
		tree: {
			id: tree._id.toString(),
			name: tree.name,
			species: tree.species,
			estimatedAge: tree.estimatedAge ?? null,
			plantedDate: tree.plantedDate?.toISOString().split('T')[0] ?? '',
			plantedBy: tree.plantedBy ?? '',
			height: tree.height ?? null,
			trunkDiameter: tree.trunkDiameter ?? null,
			location: {
				coordinates: tree.location.coordinates,
				address: tree.location.address ?? ''
			},
			tags: (tree.tags ?? []).join(', '),
			features: (tree.features ?? []).join(', '),
			description: tree.description ?? '',
			photos: (tree.photos as any[]).map((p) => ({
				id: p._id.toString(),
				url: p.url,
				key: p.key,
				caption: p.caption ?? ''
			}))
		}
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });

		const isAdmin = (session.user as any).role === 'admin';

		await connectDB();
		const existingTree = await TreeModel.findById(params.id).lean();
		if (!existingTree) return fail(404, { error: 'Tree not found' });

		const isOwner = session.user.id === existingTree.createdBy;
		const treeStatus = (existingTree as any).status ?? 'approved';
		if (!isAdmin && !(isOwner && treeStatus === 'pending')) return fail(403, { error: 'Not authorised' });

		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const species = form.get('species')?.toString().trim();
		const estimatedAge = form.get('estimatedAge')?.toString().trim();
		const height = form.get('height')?.toString().trim();
		const trunkDiameter = form.get('trunkDiameter')?.toString().trim();
		const plantedDate = form.get('plantedDate')?.toString().trim();
		const plantedBy = form.get('plantedBy')?.toString().trim();
		const latitude = form.get('latitude')?.toString().trim();
		const longitude = form.get('longitude')?.toString().trim();
		const address = form.get('address')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const tags = form.get('tags')?.toString().trim();
		const features = form.get('features')?.toString().trim();
		const newPhotos = form.getAll('photos') as File[];
		const removePhotoIds = form.getAll('removePhoto').map((id) => id.toString());

		if (!name) return fail(400, { error: 'Tree name is required.' });
		if (!species) return fail(400, { error: 'Species is required.' });
		if (!latitude || !longitude) return fail(400, { error: 'Location coordinates are required.' });

		const lat = parseFloat(latitude!);
		const lng = parseFloat(longitude!);
		if (isNaN(lat) || isNaN(lng)) return fail(400, { error: 'Invalid coordinates.' });

		await connectDB();

		// Remove photos
		for (const photoId of removePhotoIds) {
			const photo = await PhotoModel.findById(photoId);
			if (photo) {
				try { await deletePhoto(photo.key); } catch {}
				await photo.deleteOne();
				await TreeModel.updateOne({ _id: params.id }, { $pull: { photos: photo._id } });
			}
		}

		// Upload new photos
		const newPhotoIds: string[] = [];
		const validPhotos = newPhotos.filter((f) => f.size > 0);
		for (const file of validPhotos) {
			try {
				const result = await uploadPhoto(file, 'trees');
				const photo = await PhotoModel.create({
					url: result.url,
					key: result.key,
					uploadedBy: session.user.id,
					tree: params.id
				});
				newPhotoIds.push(photo._id.toString());
			} catch {}
		}

		try {
			await TreeModel.findByIdAndUpdate(params.id, {
				name,
				species,
				estimatedAge: estimatedAge ? parseInt(estimatedAge) : undefined,
				height: height ? parseFloat(height) : undefined,
				trunkDiameter: trunkDiameter ? parseFloat(trunkDiameter) : undefined,
				plantedDate: plantedDate ? new Date(plantedDate) : undefined,
				plantedBy: plantedBy || undefined,
				location: {
					type: 'Point',
					coordinates: [lng, lat],
					address: address || undefined
				},
				tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
				features: features ? features.split(',').map((f) => f.trim()).filter(Boolean) : [],
				description: description || undefined,
				...(newPhotoIds.length > 0 ? { $push: { photos: { $each: newPhotoIds } } } : {})
			});

			throw redirect(303, `/trees/${params.id}`);
		} catch (e: any) {
			if (e.status === 303) throw e;
			return fail(500, { error: e.message ?? 'Failed to update tree.' });
		}
	},

	delete: async ({ params, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });

		const isAdmin = (session.user as any).role === 'admin';

		await connectDB();

		const tree = await TreeModel.findById(params.id).populate('photos').lean();
		if (!tree) return fail(404, { error: 'Tree not found' });

		const isOwner = session.user.id === tree.createdBy;
		const treeStatus = (tree as any).status ?? 'approved';
		if (!isAdmin && !(isOwner && treeStatus === 'pending')) return fail(403, { error: 'Not authorised' });

		// Delete photos from R2
		for (const photo of (tree.photos as any[])) {
			try { await deletePhoto(photo.key); } catch {}
			await PhotoModel.findByIdAndDelete(photo._id);
		}

		await TreeModel.findByIdAndDelete(params.id);
		throw redirect(303, '/trees');
	}
};
