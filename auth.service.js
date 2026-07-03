/**
 * AuthService — login/lockout logic.
 */
export class AuthService {
    constructor() {
        this.maxAttempts = 5;
        this.lockoutMs = 30000;
        this.attempts = 0;
        this.lockedUntil = 0;
    }

    isLocked() {
        return Date.now() < this.lockedUntil;
    }

    remainingLockMs() {
        return Math.max(0, this.lockedUntil - Date.now());
    }

    registerFailure() {
        this.attempts++;
        if (this.attempts >= this.maxAttempts) {
            this.lockedUntil = Date.now() + this.lockoutMs;
            this.attempts = 0;
        }
    }

    registerSuccess() {
        this.attempts = 0;
        this.lockedUntil = 0;
    }

    /**
     * Any non-empty email + non-empty password logs in.
     */
    async login(email, password) {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (this.isLocked()) {
            throw new Error('LOCKED');
        }

        if (!email || !password) {
            this.registerFailure();
            throw new Error('INVALID');
        }

        this.registerSuccess();
        const name = email.split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        return { name, email, role: 'Member' };
    }
}
