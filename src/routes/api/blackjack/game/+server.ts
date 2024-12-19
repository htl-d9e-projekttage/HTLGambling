import { BlackjackGame } from '$lib/server/bj_game';
import { runningBJGames } from '$lib/server/serverStores';
import { json } from '@sveltejs/kit';

export async function POST({request, locals}) {
    const user = locals.user;
    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (runningBJGames.has(user.id)) {
        return json({ error: 'Game already in progress' }, { status: 400 });
    }

    const { bet } = await request.json();

    if (typeof bet !== 'number' || bet < 1) {
        return json({ error: 'Invalid bet' }, { status: 400 });
    }

    if (user.money < bet) {
        return json({ error: 'Insufficient funds' }, { status: 400 });
    }
    
    const game = new BlackjackGame();
    runningBJGames.set(user.id, game);
    try {
        game.start(bet, user.id);
        return json({ game });
    } catch (e) {
        runningBJGames.delete(user.id);
        return json({ error: e }, { status: 400 });
    }
}

export async function DELETE({locals}) {
    const user = locals.user;
    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!runningBJGames.has(user.id)) {
        return json({ error: 'No game in progress' }, { status: 400 });
    }

    runningBJGames.delete(user.id);
    return json({ message: 'Game deleted' });
}

export async function GET({locals}) {
    const user = locals.user;
    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = runningBJGames.get(user.id);
    if (!game) {
        return json({ error: 'No game in progress' }, { status: 400 });
    }
    return json({ game });
}