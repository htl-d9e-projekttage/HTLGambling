import { redirect, type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	if (user?.verified === 0 && event.url.pathname !== '/auth/verify') {
		redirect(302, '/auth/verify');
	}

	if (user?.verified === 1 && event.url.pathname === '/auth/verify') {
		redirect(302, '/');
	}

	if (user) auth.updateStreak(user?.id);

	return resolve(event);
};

export const handle: Handle = handleAuth;
