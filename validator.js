/**
 * Validator — field + password-strength validation.
 */
export class Validator {
    // Any email is accepted — only checking that something was typed.
    static validateEmail(value) {
        if (!value || !value.trim()) return 'Email is required';
        return '';
    }

    static validatePassword(value) {
        if (!value) return 'Password is required';
        if (value.length < 4) return 'Password must be at least 4 characters';
        return '';
    }

    static scorePassword(value) {
        let score = 0;
        if (!value) return 0;
        if (value.length >= 6) score++;
        if (value.length >= 10) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;
        return Math.min(score, 4);
    }
}
