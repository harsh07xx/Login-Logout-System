/**
 * Minimal Express server.
 * - Serves the static frontend (/frontend)
 * - Proxies avatar/location lookups so the browser never needs
 *   third-party API keys or fights CORS.
 */
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'frontend')));

// GET /api/avatar -> { url }
app.get('/api/avatar', async (req, res) => {
    try {
        const response = await fetch('https://randomuser.me/api/');
        const data = await response.json();
        const url = data?.results?.[0]?.picture?.large || null;
        res.json({ url });
    } catch (err) {
        res.status(502).json({ url: null, error: 'avatar lookup failed' });
    }
});

// GET /api/location -> { city, country }
app.get('/api/location', async (req, res) => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (!data || data.error) {
            return res.status(502).json({ error: 'location lookup failed' });
        }
        res.json({ city: data.city, country: data.country_name });
    } catch (err) {
        res.status(502).json({ error: 'location lookup failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Login app running at http://localhost:${PORT}`);
});
