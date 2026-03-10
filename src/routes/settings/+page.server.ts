import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

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

		if (!name || !username) {
			return { error: 'Name and username are required.', tab: 'profile' };
		}
		if (username.length < 3) {
			return { error: 'Username must be at least 3 characters.', tab: 'profile' };
		}

		try {
			await auth.api.updateUser({
				headers: request.headers,
				body: { name, username }
			});
			return { success: 'Profile updated successfully.', tab: 'profile' };
		} catch (e: any) {
			return { error: e?.message ?? 'Failed to update profile.', tab: 'profile' };
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
