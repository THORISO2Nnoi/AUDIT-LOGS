# Audit Log Console

Preview project for the broker-platform audit logging feature, using **AB Number + password** authentication.

## 📂 Structure

- `index.html` — Login page
- `dashboard.html` — Audit console (8 views)
- `css/` — Stylesheets
- `js/` — Logic (login, dashboard, charts, filters)
- `data/` — Sample JSON data
- `docs/` — Specs (auth, schema)

## 🚀 Running Locally

Use Live Server in VS Code (right-click `index.html` → *Open with Live Server*),
or a Python server:

    python3 -m http.server 5500

Then visit: http://localhost:5500

## 🔑 Demo Login

Use any valid AB Number from `data/brokers.json` — e.g. `AB12345`.

Password must be 8+ chars with uppercase, lowercase, digit, and symbol.  
Example: `Test@1234`

## 🔒 Security

- Format validation: `^AB\d{5,7}$`
- Lockout after 5 failed attempts (15 minutes)
- All login attempts written to audit log
- Session stored in `localStorage`