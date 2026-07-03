/**
 * StorageService — all localStorage reads/writes.
 */
export class StorageService {
    constructor() {
        this.keys = {
            session: 'auth_session',
            history: 'login_history',
            email: 'rememberedEmail',
            theme: 'theme'
        };
    }

    _get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    getSession() {
        return this._get(this.keys.session);
    }

    setSession(session) {
        this._set(this.keys.session, session);
    }

    clearSession() {
        localStorage.removeItem(this.keys.session);
    }

    getHistory() {
        return this._get(this.keys.history) || [];
    }

    addHistory(entry) {
        const history = this.getHistory();
        history.unshift(entry);
        this._set(this.keys.history, history.slice(0, 5));
    }

    getRememberedEmail() {
        return localStorage.getItem(this.keys.email) || '';
    }

    setRememberedEmail(email) {
        localStorage.setItem(this.keys.email, email);
    }

    clearRememberedEmail() {
        localStorage.removeItem(this.keys.email);
    }

    getTheme() {
        return localStorage.getItem(this.keys.theme) || 'light';
    }

    setTheme(theme) {
        localStorage.setItem(this.keys.theme, theme);
    }
}
