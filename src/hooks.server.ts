import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';

const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email'];

export const handle: Handle = async ({ event, resolve }) => {
	// Let Better Auth handle its API routes first
	if (event.url.pathname.startsWith('/api/auth')) {
		return svelteKitHandler({ event, resolve, auth, building });
	}

	const session = await auth.api.getSession({ headers: event.request.headers });
	const isAuthPage = AUTH_PAGES.some((p) => event.url.pathname.startsWith(p));

	if (session?.user) {
		if (!session.user.emailVerified) {
			// Unverified users can only access verify-email and api routes
			if (!event.url.pathname.startsWith('/auth/verify-email') && !event.url.pathname.startsWith('/api/auth')) {
				throw redirect(302, `/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
			}
		} else if (isAuthPage) {
			// Verified + logged-in users should not visit auth pages
			throw redirect(302, '/');
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
