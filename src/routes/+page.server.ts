import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllUsers } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}
	const leaderboardData = await getAllUsers();
	return { user: event.locals.user, leaderboardData };
};
