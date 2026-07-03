/**
 * SessionManager — countdown + auto-logout.
 */
export class SessionManager {
    constructor(onExpire) {
        this.onExpire = onExpire;
        this.durationMs = 5 * 60 * 1000; // 5 minute demo session
        this.expiresAt = 0;
        this.intervalId = null;
    }

    start(displayEl, expiresAt) {
        this.expiresAt = expiresAt || (Date.now() + this.durationMs);
        this.displayEl = displayEl;
        this.tick();
        this.intervalId = setInterval(() => this.tick(), 1000);
        return this.expiresAt;
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = null;
    }

    tick() {
        const remaining = this.expiresAt - Date.now();
        if (remaining <= 0) {
            this.stop();
            this.onExpire();
            return;
        }
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
        if (this.displayEl) {
            this.displayEl.textContent = `Session expires in ${mins}:${secs}`;
        }
    }
}
