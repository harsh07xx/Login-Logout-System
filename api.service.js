/**
 * ApiService — real external API calls (fetch).
 * Routed through the local backend (see /backend) which proxies
 * randomuser.me and ipapi.co so no keys/CORS issues hit the browser.
 */
export class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /** Fetches a real profile photo for the logged-in user. */
    async fetchAvatar() {
        try {
            const res = await fetch(`${this.baseUrl}/avatar`);
            if (!res.ok) throw new Error('avatar request failed');
            const data = await res.json();
            return data.url || null;
        } catch (e) {
            return null;
        }
    }

    /** Fetches approximate location from the visitor's IP. */
    async fetchLocation() {
        try {
            const res = await fetch(`${this.baseUrl}/location`);
            if (!res.ok) throw new Error('location request failed');
            const data = await res.json();
            if (!data || data.error) return null;
            return { city: data.city, country: data.country };
        } catch (e) {
            return null;
        }
    }
}
