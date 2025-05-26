export function isJwtExpired(token: string): boolean {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        return exp < now;
    } catch {
        return true; // invalide ou expiré
    }
}