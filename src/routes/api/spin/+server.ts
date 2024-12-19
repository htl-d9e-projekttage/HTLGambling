import { getMoney, updateMoney } from "$lib/server/auth.js";
import { slotUserMap } from "$lib/server/serverStores.js";
import Slots from "$lib/server/slots/slots";


export const POST = async (request) => {
    if (!request.locals.user) {
        return new Response(null, {
            status: 401
        });
    }

    let slot = slotUserMap.get(request.locals.user.id);
    if (!slot) {
        slot = new Slots(getMoney(request.locals.user.id) || 0);
        slotUserMap.set(request.locals.user.id, slot);
    }

    const bet = await request.url.searchParams.get('bet');

    try {
        slot.setBet(Number(bet));
    } catch (e) {
        return new Response(JSON.stringify({ error: "no money" }), {
            headers: {
                "content-type": "application/json"
            },
            status: 400
        });
    }
    await slot.spin();

    let ret = slot.getCurrentSpin();

    //update user money
    updateMoney(request.locals.user.id, slot.getWin()-slot.getBet());

    return new Response(JSON.stringify(ret), {
        headers: {
            "content-type": "application/json"
        }
    });
}


export const GET = async (request) => {
    if (!request.locals.user) {
        return new Response(null, {
            status: 401
        });
    }
    let slot = slotUserMap.get(request.locals.user.id);
    if (!slot) {
        slot = new Slots(request.locals.user.money|| 0);
        slotUserMap.set(request.locals.user.id, slot);
    }

    let ret = {
        money: request.locals.user.money,
        oldMoney: slot.getOldMoney(),
        history: slot.getHistory()
    }
    return new Response(JSON.stringify(ret), {
        headers: {
            "content-type": "application/json"
        }
    });
}