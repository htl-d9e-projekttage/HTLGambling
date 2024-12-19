import { runningBJGames } from '$lib/server/serverStores';
import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentGame = runningBJGames.get(locals.user.id);
	
    if (!currentGame) {
		return json({ error: 'No game in progress' }, { status: 400 });
	}

	const { action } = await request.json();
    
    try {
        currentGame.playerTurn(action);
        return json({ game: currentGame });
    } catch (e) {
        return json({ error: e }, { status: 400 });
    }
}