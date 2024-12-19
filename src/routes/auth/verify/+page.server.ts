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
        const a1 = formData.get('a1') as string;
        const a2 = formData.get('a2') as string;
        const a3 = formData.get('a3') as string;
        const a4 = formData.get('a4') as string;
        const a5 = formData.get('a5') as string;
        const a6 = formData.get('a6') as string;
        const a7 = formData.get('a7') as string;
        const a8 = formData.get('a8') as string;
        const a9 = formData.get('a9') as string;
        const a10 = formData.get('a10') as string;
        const answers = `
        1: ${a1}\n
        2: ${a2}\n
        3: ${a3}\n
        4: ${a4}\n
        5: ${a5}\n
        6: ${a6}\n
        7: ${a7}\n
        8: ${a8}\n
        9: ${a9}\n
        10: ${a10}\n
        `;

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
