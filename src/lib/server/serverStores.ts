import type { BlackjackGame } from './bj_game';
import type Slots from './slots/slots';

export let runningBJGames: Map<string, BlackjackGame> = new Map();
export const slotUserMap = new Map<string, Slots>();
