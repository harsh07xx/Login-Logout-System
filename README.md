# Login App

A demo login/authentication UI, split into a proper multi-language
repository structure: static frontend, a small Node/Express backend
that proxies external APIs, and Python/Bash tooling for local testing.

## Repository layout

```
login-app/
├── frontend/                 # HTML / CSS / JavaScript (client)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js           # entry point
│       ├── ui.js             # LoginUI — wires everything to the DOM
│       ├── auth.service.js   # login / lockout logic
│       ├── storage.service.js# localStorage wrapper
│       ├── api.service.js    # calls the backend proxy endpoints
│       ├── validator.js      # field + password-strength validation
│       └── session.manager.js# countdown + auto-logout
├── backend/                  # Node.js / Express (server)
│   ├── server.js
│   └── package.json
├── scripts/
│   ├── setup.sh              # Bash: install deps + run server
│   └── seed_users.py         # Python: generate demo accounts
├── .gitignore
└── README.md
```

Languages used: **HTML, CSS, JavaScript, Node.js, Python, Bash, Markdown, JSON**.

## Features

- Real-time field validation and a live password-strength meter
- "Remember me" + persistent session that survives a page reload
- Login attempt limiter with a temporary lockout
- Session countdown timer with auto-logout
- Dark / light theme toggle
- Login history log (kept in `localStorage`)
- Real API calls (via the backend proxy) for a profile avatar and
  IP-based location on successful login

## Running it

```bash
# 1. one-liner: installs deps, seeds demo users, starts the server
./scripts/setup.sh

# — or manually —
cd backend
npm install
npm start
```

Then open **http://localhost:3000**. Any non-empty email/password
combination logs you in (this is a UI/UX demo, not a real auth
backend) — five failed attempts triggers a 30-second lockout.

## Generating demo accounts

```bash
python3 scripts/seed_users.py --count 10 --out demo-users.json
```

This writes a JSON file of realistic-looking name/email/password
combinations you can use while manually testing the form.

## Notes

- The frontend calls `/api/avatar` and `/api/location`, which the
  Express server proxies to `randomuser.me` and `ipapi.co`
  respectively, so no API keys or CORS workarounds are needed in the
  browser.
- All client state (session, theme, remembered email, login history)
  lives in `localStorage`, matching the original single-file
  prototype's behavior.
