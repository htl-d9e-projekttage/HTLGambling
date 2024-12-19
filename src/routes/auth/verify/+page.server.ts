import * as auth from '$lib/server/auth';
import { sendAIVerificaition } from '$lib/server/ai';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/auth/login');
    }
    return { user: event.locals.user };
};

export const actions: Actions = {
    verify: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        const formData = await event.request.formData();
		const answers = formData.get('answers') as string;
        const aiRes = await sendAIVerificaition(answers);
        if (!aiRes) {
            return fail(500);
        }

        if (aiRes.approved) {
            await auth.verifyUser(event.locals.user?.id ?? '');
            return redirect(302, '/auth?approved=true&explanation=' + encodeURIComponent(aiRes.explanation));
        } else {
            return fail(400, { message: aiRes.explanation });
        }
    }
};
