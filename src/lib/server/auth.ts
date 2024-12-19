import type { RequestEvent } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			user: { id: table.user.id, username: table.user.username, age: table.user.age, verified: table.user.verified, money: table.user.money, streak: table.user.streak, lastLogin: table.user.lastLogin},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function deleteUser(userId: string) {
	await db.delete(table.user).where(eq(table.user.id, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export function getUserById(userId: string) {
	return db.select().from(table.user).where(eq(table.user.id, userId)).get();
}

export function verifyUser(userId: string) {
	return db
		.update(table.user)
		.set({ verified: 1 })
		.where(eq(table.user.id, userId));
}

export function getAllUsers() {
	return db.select().from(table.user).orderBy(desc(table.user.money));
}

export function getMoney(userId: string) {
	return db.select({ money: table.user.money }).from(table.user).where(eq(table.user.id, userId)).get()?.money;
}

export function updateMoney(userId: string, money: number) {
	return db.update(table.user).set({ money }).where(eq(table.user.id, userId));
}

export async function addMoney(userId: string, amount: number) {
	return await db
		.update(table.user)
		.set({ money: (getMoney(userId) ?? 0) + amount })
		.where(eq(table.user.id, userId));
}

export function getLastLogin(userId: string) {
	return db.select({ lastLogin: table.user.lastLogin }).from(table.user).where(eq(table.user.id, userId)).get()?.lastLogin;
}

export function updateLastLogin(userId: string) {
	const currentDate = new Date();
	return db.update(table.user).set({ lastLogin: currentDate }).where(eq(table.user.id, userId));
}

export function getStreak(userId: string) {
	return db.select({ streak: table.user.streak }).from(table.user).where(eq(table.user.id, userId)).get()?.streak;
}

export async function updateStreak(userId: string) {
    const currentDate = new Date();
    const lastLogin = getLastLogin(userId);
    if (!lastLogin) {
        await updateLastLogin(userId);
        return db.update(table.user).set({ streak: 1 }).where(eq(table.user.id, userId));
    }

    if (lastLogin.getTime() > currentDate.getTime()) {
        throw new Error('Last login is in the future');
    }

    const daysBetween = Math.floor((currentDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (daysBetween > 1) {
        await updateLastLogin(userId);
        return db.update(table.user).set({ streak: 1 }).where(eq(table.user.id, userId));
    } else if (daysBetween === 1) {
        const currentStreak = getStreak(userId) || 0;
        await updateLastLogin(userId);
		await addMoney(userId, 5000);
        return db.update(table.user).set({ streak: currentStreak + 1 }).where(eq(table.user.id, userId));
    }

    return null;
}