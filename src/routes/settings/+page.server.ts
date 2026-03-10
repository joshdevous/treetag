import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { uploadPhoto, deletePhoto } from '$lib/server/r2';
import { MongoClient, ObjectId } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types';

const client = new MongoClient(DATABASE_URL);

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw redirect(303, '/auth/login');
	return {};
};

export const actions: Actions = {
	updateProfile: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return { error: 'Not authenticated' };

		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const username = form.get('username')?.toString().trim();
		const avatarFile = form.get('avatar') as File | null;
		const bannerFile = form.get('banner') as File | null;

		if (!name || !username) {
			return { error: 'Name and username are required.', tab: 'profile' };
		}
		if (name.length > 50) {
			return { error: 'Display name must be 50 characters or fewer.', tab: 'profile' };
		}
		if (username.length < 3) {
			return { error: 'Username must be at least 3 characters.', tab: 'profile' };
		}
		if (username.length > 20) {
			return { error: 'Username must be 20 characters or fewer.', tab: 'profile' };
		}

		try {
			// Check username uniqueness before updating
			const db = client.db('treetag');
			const existing = await db.collection('user').findOne(
				{
					username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
					_id: { $ne: new ObjectId(session.user.id) }
				},
				{ projection: { _id: 1 } }
			);
			if (existing) {
				return { error: 'That username is already taken.', tab: 'profile' };
			}

			await auth.api.updateUser({
				headers: request.headers,
				body: { name, username }
			});

        // Handle image uploads and removals
		const hasAvatar = avatarFile && avatarFile.size > 0;
		const hasBanner = bannerFile && bannerFile.size > 0;
		const removeAvatarFlag = form.get('removeAvatar') === 'true';
		const removeBannerFlag = form.get('removeBanner') === 'true';
		const needsRemoveAvatar = removeAvatarFlag && !hasAvatar;
		const needsRemoveBanner = removeBannerFlag && !hasBanner;

		if (hasAvatar || hasBanner || needsRemoveAvatar || needsRemoveBanner) {
			const db = client.db('treetag');
			const user = await db.collection('user').findOne({ _id: new ObjectId(session.user.id) });
			const sets: Record<string, string> = {};
			const unsets: Record<string, string> = {};

			if (hasAvatar) {
				if (user?.avatarKey) {
					try { await deletePhoto(user.avatarKey as string); } catch {}
				}
				const result = await uploadPhoto(avatarFile, 'avatars');
				sets.avatar = result.url;
				sets.avatarKey = result.key;
			} else if (needsRemoveAvatar) {
				if (user?.avatarKey) {
					try { await deletePhoto(user.avatarKey as string); } catch {}
				}
				unsets.avatar = '';
				unsets.avatarKey = '';
			}

			if (hasBanner) {
				if (user?.bannerKey) {
					try { await deletePhoto(user.bannerKey as string); } catch {}
				}
				const result = await uploadPhoto(bannerFile, 'banners');
				sets.banner = result.url;
				sets.bannerKey = result.key;
			} else if (needsRemoveBanner) {
				if (user?.bannerKey) {
					try { await deletePhoto(user.bannerKey as string); } catch {}
				}
				unsets.banner = '';
				unsets.bannerKey = '';
			}

			const updateOp: Record<string, any> = {};
			if (Object.keys(sets).length > 0) updateOp.$set = sets;
			if (Object.keys(unsets).length > 0) updateOp.$unset = unsets;

			if (Object.keys(updateOp).length > 0) {
				await db.collection('user').updateOne(
					{ _id: new ObjectId(session.user.id) },
					updateOp
				);
			}
			}

			return { success: 'Profile updated successfully.', tab: 'profile' };
		} catch (e: any) {
			return { error: e?.message ?? 'Failed to update profile.', tab: 'profile' };
		}
	},

	removeImage: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return { error: 'Not authenticated' };

		const form = await request.formData();
		const type = form.get('type')?.toString();

		if (type !== 'avatar' && type !== 'banner') {
			return { error: 'Invalid image type.', tab: 'profile' };
		}

		try {
			const db = client.db('treetag');
			const user = await db.collection('user').findOne({ _id: new ObjectId(session.user.id) });
			const keyField = type === 'avatar' ? 'avatarKey' : 'bannerKey';

			if (user?.[keyField]) {
				try { await deletePhoto(user[keyField] as string); } catch {}
			}

			await db.collection('user').updateOne(
				{ _id: new ObjectId(session.user.id) },
				{ $unset: { [type]: '', [keyField]: '' } }
			);

			return { success: `${type === 'avatar' ? 'Profile picture' : 'Banner'} removed.`, tab: 'profile' };
		} catch (e: any) {
			return { error: e?.message ?? 'Failed to remove image.', tab: 'profile' };
		}
	},

	changePassword: async ({ request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) return { error: 'Not authenticated' };

		const form = await request.formData();
		const currentPassword = form.get('currentPassword')?.toString();
		const newPassword = form.get('newPassword')?.toString();
		const confirmPassword = form.get('confirmPassword')?.toString();

		if (!currentPassword || !newPassword || !confirmPassword) {
			return { error: 'All password fields are required.', tab: 'security' };
		}
		if (newPassword.length < 8) {
			return { error: 'New password must be at least 8 characters.', tab: 'security' };
		}
		if (newPassword !== confirmPassword) {
			return { error: 'Passwords do not match.', tab: 'security' };
		}

		try {
			await auth.api.changePassword({
				headers: request.headers,
				body: { currentPassword, newPassword }
			});
			return { success: 'Password changed successfully.', tab: 'security' };
		} catch (e: any) {
			return { error: e?.message ?? 'Failed to change password.', tab: 'security' };
		}
	}
};
