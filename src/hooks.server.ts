import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';

const VERIFICATION_BYPASS = ['/auth/verify-email', '/api/auth'];

export const handle: Handle = async ({ event, resolve }) => {
	// Let Better Auth handle its API routes first
	if (event.url.pathname.startsWith('/api/auth')) {
		return svelteKitHandler({ event, resolve, auth, building });
	}

	// Check session for email verification enforcement
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session?.user && !session.user.emailVerified) {
		const bypassed = VERIFICATION_BYPASS.some((p) => event.url.pathname.startsWith(p));
		if (!bypassed) {
			throw redirect(302, `/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
