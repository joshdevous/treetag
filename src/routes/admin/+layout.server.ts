import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, url }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		throw redirect(303, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	if ((session.user as any).role !== 'admin') {
		throw error(403, 'Admins only.');
	}
	return {};
};
