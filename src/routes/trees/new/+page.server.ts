import { redirect, fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { TreeModel } from '$lib/server/db/models/tree';
import { PhotoModel } from '$lib/server/db/models/photo';
import { uploadPhoto } from '$lib/server/r2';
import crypto from 'crypto';
import type { PageServerLoad, Actions } from './$types';

function parsePlantedDateInput(value: string): Date | null {
	const text = value.trim();
	if (!text) return null;

	const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (dmy) {
		const day = Number(dmy[1]);
		const month = Number(dmy[2]);
		const year = Number(dmy[3]);
		const d = new Date(year, month - 1, day);
		if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) return d;
		return null;
	}

	const ymd = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (ymd) {
		const year = Number(ymd[1]);
		const month = Number(ymd[2]);
		const day = Number(ymd[3]);
		const d = new Date(year, month - 1, day);
		if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) return d;
		return null;
	}

	const fallback = new Date(text);
	if (isNaN(fallback.getTime())) return null;
	return fallback;
}

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw redirect(303, '/auth/login');
	const isAdmin = (session.user as any).role === 'admin';
	return { isAdmin };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return fail(401, { error: 'Not authenticated' });

		const isAdmin = (session.user as any).role === 'admin';

		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const species = form.get('species')?.toString().trim();
		const estimatedAge = form.get('estimatedAge')?.toString().trim();
		const height = form.get('height')?.toString().trim();
		const trunkDiameter = form.get('trunkDiameter')?.toString().trim();
		const plantedDate = form.get('plantedDate')?.toString().trim();
		const plantedBy = form.get('plantedBy')?.toString().trim();
		const postcode = form.get('postcode')?.toString().trim();
		const latitude = form.get('latitude')?.toString().trim();
		const longitude = form.get('longitude')?.toString().trim();
		const address = form.get('address')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const tags = form.get('tags')?.toString().trim();
		const features = form.get('features')?.toString().trim();
		const photos = form.getAll('photos') as File[];

		// Required fields
		if (!name) return fail(400, { error: 'Tree name is required.', field: 'name' });
		if (!species) return fail(400, { error: 'Species is required.', field: 'species' });
		if (!latitude || !longitude) return fail(400, { error: 'Location coordinates are required.', field: 'latitude' });

		// Length limits
		if (name.length > 100) return fail(400, { error: 'Name must be 100 characters or less.', field: 'name' });
		if (species.length > 100) return fail(400, { error: 'Species must be 100 characters or less.', field: 'species' });
		if (description && description.length > 2000) return fail(400, { error: 'Description must be 2,000 characters or less.', field: 'description' });
		const combinedAddress = [address, postcode].filter(Boolean).join(', ');
		if (combinedAddress && combinedAddress.length > 200) return fail(400, { error: 'Address must be 200 characters or less.', field: 'address' });
		if (plantedBy && plantedBy.length > 100) return fail(400, { error: 'Planted by must be 100 characters or less.', field: 'plantedBy' });

		// Numeric validation
		if (estimatedAge) {
			const age = parseInt(estimatedAge);
			if (isNaN(age) || age < 0 || age > 5000) return fail(400, { error: 'Estimated age must be between 0 and 5,000 years.', field: 'estimatedAge' });
		}
		if (height) {
			const h = parseFloat(height);
			if (isNaN(h) || h < 0 || h > 200) return fail(400, { error: 'Height must be between 0 and 200 metres.', field: 'height' });
		}
		if (trunkDiameter) {
			const d = parseFloat(trunkDiameter);
			if (isNaN(d) || d < 0 || d > 2000) return fail(400, { error: 'Trunk diameter must be between 0 and 2,000 cm.', field: 'trunkDiameter' });
		}

		// Planted date cannot be in the future
		let parsedPlantedDate: Date | null = null;
		if (plantedDate) {
			parsedPlantedDate = parsePlantedDateInput(plantedDate);
			if (!parsedPlantedDate) return fail(400, { error: 'Invalid planted date. Use DD/MM/YYYY.', field: 'plantedDate' });
			if (parsedPlantedDate > new Date()) return fail(400, { error: 'Planted date cannot be in the future.', field: 'plantedDate' });
		}

		// Coordinate validation
		const lat = parseFloat(latitude);
		const lng = parseFloat(longitude);
		if (isNaN(lat) || isNaN(lng)) return fail(400, { error: 'Invalid coordinates.', field: 'latitude' });
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return fail(400, { error: 'Coordinates out of range.', field: 'latitude' });

		// Tags & features limits
		const parsedTags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 20) : [];
		const parsedFeatures = features ? features.split(',').map((f) => f.trim()).filter(Boolean).slice(0, 20) : [];
		if (parsedTags.some((t) => t.length > 50)) return fail(400, { error: 'Each tag must be 50 characters or less.', field: 'tags' });
		if (parsedFeatures.some((f) => f.length > 100)) return fail(400, { error: 'Each feature must be 100 characters or less.', field: 'features' });

		// Photo validation
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		const maxPhotoSize = 10 * 1024 * 1024; // 10 MB
		const validPhotos = photos.filter((f) => f.size > 0);
		if (validPhotos.length > 10) return fail(400, { error: 'You can upload a maximum of 10 photos.', field: 'photos' });
		for (const file of validPhotos) {
			if (!allowedTypes.includes(file.type)) return fail(400, { error: `Invalid file type: ${file.name}. Only JPG, PNG, WebP, and GIF are allowed.`, field: 'photos' });
			if (file.size > maxPhotoSize) return fail(400, { error: `${file.name} exceeds the 10 MB size limit.`, field: 'photos' });
		}

		await connectDB();

		// Generate unique QR code ID
		let qrCodeId: string;
		let attempts = 0;
		do {
			qrCodeId = crypto.randomBytes(4).toString('hex');
			const existing = await TreeModel.findOne({ qrCodeId });
			if (!existing) break;
			attempts++;
		} while (attempts < 10);

		if (attempts >= 10) return fail(500, { error: 'Failed to generate unique QR code.' });

		// Upload photos
		const photoIds: string[] = [];
		for (const file of validPhotos) {
			try {
				const result = await uploadPhoto(file, 'trees');
				const photo = await PhotoModel.create({
					url: result.url,
					key: result.key,
					uploadedBy: session.user.id
				});
				photoIds.push(photo._id.toString());
			} catch {
				// Skip failed uploads
			}
		}

		try {
			const tree = await TreeModel.create({
				name,
				species,
				estimatedAge: estimatedAge ? parseInt(estimatedAge) : undefined,
				height: height ? parseFloat(height) : undefined,
				trunkDiameter: trunkDiameter ? parseFloat(trunkDiameter) : undefined,
				plantedDate: parsedPlantedDate ?? undefined,
				plantedBy: plantedBy || undefined,
				location: {
					type: 'Point',
					coordinates: [lng, lat],
					address: combinedAddress || undefined
				},
				qrCodeId,
				photos: photoIds,
				tags: parsedTags,
				features: parsedFeatures,
				description: description || undefined,
				status: isAdmin ? 'approved' : 'pending',
				createdBy: session.user.id
			});

			// Link photos to tree
			if (photoIds.length > 0) {
				await PhotoModel.updateMany(
					{ _id: { $in: photoIds } },
					{ $set: { tree: tree._id } }
				);
			}

			throw redirect(303, `/trees/${tree._id}`);
		} catch (e: any) {
			if (e.status === 303) throw e;
			return fail(500, { error: e.message ?? 'Failed to register tree.' });
		}
	}
};
