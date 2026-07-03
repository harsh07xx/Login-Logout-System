import { StorageService } from './storage.service.js';
import { ApiService } from './api.service.js';
import { AuthService } from './auth.service.js';
import { Validator } from './validator.js';
import { SessionManager } from './session.manager.js';

/**
 * LoginUI — wires all services to the DOM.
 * Features:
 *   - Real-time validation, password strength meter
 *   - Remember-me, persistent session (survives page reload)
 *   - Login attempt limiter with temporary lockout
 *   - Session timer with auto-logout
 *   - Dark / light theme toggle
 *   - Login history log (localStorage)
 *   - API calls: random avatar photo + IP-based location
 */
export class LoginUI {
    constructor() {
        this.storage = new StorageService();
        this.api = new ApiService();
        this.auth = new AuthService();
        this.session = new SessionManager(() => this.handleSessionExpired());

        this.el = {
            loginForm: document.getElementById('loginForm'),
            formEl: document.getElementById('loginFormEl'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            alert: document.getElementById('alert'),
            email: document.getElementById('email'),
            emailError: document.getElementById('emailError'),
            password: document.getElementById('password'),
            passwordError: document.getElementById('passwordError'),
            strengthFill: document.getElementById('strengthFill'),
            strengthLabel: document.getElementById('strengthLabel'),
            togglePasswordBtn: document.getElementById('togglePasswordBtn'),
            rememberMe: document.getElementById('rememberMe'),
            attemptsLabel: document.getElementById('attemptsLabel'),
            submitBtn: document.getElementById('submitBtn'),
            avatarLarge: document.getElementById('avatarLarge'),
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            locationInfo: document.getElementById('locationInfo'),
            sessionTimer: document.getElementById('sessionTimer'),
            recentLogins: document.getElementById('recentLogins'),
            recentLoginsList: document.getElementById('recentLoginsList'),
            logoutBtn: document.getElementById('logoutBtn'),
            themeToggle: document.getElementById('themeToggle')
        };

        this.bindEvents();
        this.restoreRememberedEmail();
        this.restoreTheme();
        this.restoreSession();
    }

    bindEvents() {
        this.el.formEl.addEventListener('submit', e => this.handleSubmit(e));
        this.el.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        this.el.password.addEventListener('input', () => this.updateStrengthMeter());
        this.el.email.addEventListener('blur', () => this.validateField('email'));
        this.el.password.addEventListener('blur', () => this.validateField('password'));
        this.el.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.el.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    /* ---------- Persisted state ---------- */

    restoreRememberedEmail() {
        const saved = this.storage.getRememberedEmail();
        if (saved) {
            this.el.email.value = saved;
            this.el.rememberMe.checked = true;
        }
    }

    restoreTheme() {
        if (this.storage.getTheme() === 'dark') {
            document.body.classList.add('dark');
            this.el.themeToggle.textContent = '☀️';
        }
    }

    restoreSession() {
        const session = this.storage.getSession();
        if (session && session.expiresAt > Date.now()) {
            this.showWelcome(session.user, session.expiresAt, true);
        } else if (session) {
            this.storage.clearSession();
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        this.el.themeToggle.textContent = isDark ? '☀️' : '🌙';
        this.storage.setTheme(isDark ? 'dark' : 'light');
    }

    /* ---------- Form helpers ---------- */

    togglePasswordVisibility() {
        const input = this.el.password;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        this.el.togglePasswordBtn.textContent = isHidden ? '👁️' : '🔒';
    }

    validateField(field) {
        if (field === 'email') {
            const msg = Validator.validateEmail(this.el.email.value.trim());
            this.el.emailError.textContent = msg;
            this.el.emailError.classList.toggle('show', !!msg);
            return !msg;
        }
        if (field === 'password') {
            const msg = Validator.validatePassword(this.el.password.value);
            this.el.passwordError.textContent = msg;
            this.el.passwordError.classList.toggle('show', !!msg);
            return !msg;
        }
        return true;
    }

    updateStrengthMeter() {
        const score = Validator.scorePassword(this.el.password.value);
        const percentages = [0, 25, 55, 80, 100];
        const colors = ['#eee', '#e53935', '#fb8c00', '#fdd835', '#43a047'];
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

        this.el.strengthFill.style.width = percentages[score] + '%';
        this.el.strengthFill.style.background = colors[score];
        this.el.strengthLabel.textContent = labels[score];
    }

    showAlert(message, type) {
        this.el.alert.textContent = message;
        this.el.alert.className = `alert alert-${type}`;
        this.el.alert.classList.remove('hidden');
    }

    hideAlert() {
        this.el.alert.classList.add('hidden');
    }

    /* ---------- Auth flow ---------- */

    async handleSubmit(event) {
        event.preventDefault();
        this.hideAlert();

        const emailValid = this.validateField('email');
        const passwordValid = this.validateField('password');
        if (!emailValid || !passwordValid) {
            this.showAlert('Please fix the highlighted fields', 'error');
            return;
        }

        if (this.auth.isLocked()) {
            const secs = Math.ceil(this.auth.remainingLockMs() / 1000);
            this.showAlert(`Too many attempts. Try again in ${secs}s`, 'warning');
            return;
        }

        const email = this.el.email.value.trim();
        const password = this.el.password.value;

        this.el.submitBtn.disabled = true;
        this.el.submitBtn.textContent = 'Logging in...';

        try {
            const user = await this.auth.login(email, password);

            if (this.el.rememberMe.checked) {
                this.storage.setRememberedEmail(email);
            } else {
                this.storage.clearRememberedEmail();
            }

            this.storage.addHistory({
                name: user.name,
                email: user.email,
                time: new Date().toLocaleString()
            });

            this.showWelcome(user);
        } catch (err) {
            if (err.message === 'LOCKED') {
                const secs = Math.ceil(this.auth.remainingLockMs() / 1000);
                this.showAlert(`Too many attempts. Try again in ${secs}s`, 'warning');
            } else {
                const left = this.auth.maxAttempts - this.auth.attempts;
                this.showAlert('Please fill in all fields correctly', 'error');
                this.el.attemptsLabel.textContent = left < this.auth.maxAttempts
                    ? `${left} attempt(s) left`
                    : '';
            }
        } finally {
            this.el.submitBtn.disabled = false;
            this.el.submitBtn.textContent = 'Login';
        }
    }

    showWelcome(user, expiresAt, isRestoring = false) {
        this.el.loginForm.classList.add('hidden');
        this.el.welcomeScreen.classList.remove('hidden');
        this.el.avatarLarge.textContent = user.name.charAt(0).toUpperCase();
        this.el.userName.textContent = user.role ? `${user.name} (${user.role})` : user.name;
        this.el.userEmail.textContent = user.email;

        const finalExpiry = this.session.start(this.el.sessionTimer, expiresAt);
        this.storage.setSession({ user, expiresAt: finalExpiry });

        this.renderRecentLogins();

        if (!isRestoring) {
            this.loadAvatarFromApi();
            this.loadLocationFromApi();
        } else if (user.avatarUrl) {
            this.setAvatarImage(user.avatarUrl);
        }
    }

    renderRecentLogins() {
        const history = this.storage.getHistory();
        if (history.length === 0) {
            this.el.recentLogins.classList.add('hidden');
            return;
        }
        this.el.recentLoginsList.innerHTML = history
            .map(h => `<li><span>${h.name}</span><span>${h.time}</span></li>`)
            .join('');
        this.el.recentLogins.classList.remove('hidden');
    }

    /* ---------- Real API calls ---------- */

    async loadAvatarFromApi() {
        const url = await this.api.fetchAvatar();
        if (url) {
            this.setAvatarImage(url);
            const session = this.storage.getSession();
            if (session) {
                session.user.avatarUrl = url;
                this.storage.setSession(session);
            }
        }
    }

    setAvatarImage(url) {
        this.el.avatarLarge.innerHTML = `<img src="${url}" alt="avatar">`;
    }

    async loadLocationFromApi() {
        this.el.locationInfo.textContent = 'Detecting location...';
        const loc = await this.api.fetchLocation();
        if (loc && loc.city) {
            this.el.locationInfo.textContent = `📍 Logged in from ${loc.city}, ${loc.country}`;
        } else {
            this.el.locationInfo.textContent = '';
        }
    }

    /* ---------- Logout / expiry ---------- */

    handleSessionExpired() {
        this.showAlert('Session expired, please log in again', 'warning');
        this.handleLogout(false);
    }

    handleLogout(clearAlert = true) {
        this.session.stop();
        this.storage.clearSession();
        this.el.loginForm.classList.remove('hidden');
        this.el.welcomeScreen.classList.add('hidden');
        this.el.avatarLarge.innerHTML = '';
        this.el.locationInfo.textContent = '';
        this.el.password.value = '';
        this.el.attemptsLabel.textContent = '';
        if (clearAlert) this.hideAlert();
        this.el.submitBtn.disabled = false;
        this.el.submitBtn.textContent = 'Login';
        this.updateStrengthMeter();
    }
}
