import { env } from '$env/dynamic/private';
import * as crypto from "crypto";

const serverSeed = env.SERVER_SEED?.toString() || "nothing :(";
export function hmacSHA256(clientSeed: string, nonce: number): string {
    const message = `${clientSeed}:${nonce}`; // Combine client seed and nonce
    return crypto.createHmac("sha256", serverSeed).update(message).digest("hex");
}

export function generateClientSeed(length: number = 16): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let seed = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        seed += charset[randomIndex];
    }
    return seed;
}


export function genPercent(clientSeed: string, nonce: number ): number {
    const hash = hmacSHA256(clientSeed, nonce);
    const first8Chars = hash.slice(0, 8);
    const randomNumber = parseInt(first8Chars, 16) / 0xFFFFFFFF; // Normalize to a number between 0 and 1
    return randomNumber; // Return a number between 0 and 1
}