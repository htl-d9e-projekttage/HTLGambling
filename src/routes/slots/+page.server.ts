// src/routes/slots/+page.server.ts
import type { PageServerLoad } from './$types';
import Slots from '$lib/server/slots/slots';
import type { Spin } from '$lib/entities';
import type { Actions } from '@sveltejs/kit';
import { slotUserMap } from '$lib/server/serverStores';
import { getMoney } from '$lib/server/auth';

export const ssr = false;

let slot: Slots;

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw new Error('No user found');
	}
	slot = slotUserMap.get(user.id) || new Slots(getMoney(user.id) || 0);
	const currentSlotFace = slot.getCurrentSpin();

	return {
		props: {
			user,
			currentSlotFace
		}
	};
};
