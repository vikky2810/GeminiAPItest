## Gemini API Key Checker (HTML/CSS/JS)
![Gemini API Key Checker](./gemini-api-checker.png)

### Live Demo
- Visit the hosted app: https://gemini-api-checker.vercel.app/

A minimal, single-page web app to validate a Google Gemini API key from your browser. Paste a key to check a single key or enter multiple keys to validate them in parallel. No keys are stored.

### Features
- Dark, modern UI with blue accent
- Single-key check with clear status
- Batch check: paste multiple keys (newline or comma separated)
- Non-blocking UI, masked keys in batch results
- No external dependencies

### How it works
- Makes a GET request to `https://generativelanguage.googleapis.com/v1/models`
- Sends header `Authorization: Bearer <API_KEY>`
- Status handling:
  - 200 → Valid & working API key
  - 401 → Invalid API key
  - Other → Possibly valid but restricted (status shown)

### Project structure
- `index.html` – markup and asset links
- `styles.css` – theme and layout styles
- `app.js` – logic for single and multi-key validation

### Run locally
You can open `index.html` directly in a browser. If you encounter CORS errors, serve the folder with a simple static server.

Examples:

- Python 3
```bash
python -m http.server 5500
```
Then open `http://localhost:5500/index.html`.

- Node (npx)
```bash
npx serve --single --listen 5500 .
```

- PowerShell (Windows 10+)
```powershell
Start-Process http://localhost:5500/index.html; python -m http.server 5500
```

### Usage
1. Open the page in your browser.
2. For a single key: paste into the input and click “Check Key”.
3. For multiple keys: paste one per line (or comma separated) and click “Check Keys”.
4. Read the status messages under each section.

Notes:
- Keys are only used in-memory for the request and are never stored.
- Network/CORS restrictions in your environment may block requests; use a local server as above.

### Customization
- Colors and spacing are defined in CSS variables at the top of `styles.css` (e.g., `--accent`, `--bg`, `--text`).
- Result text and thresholds are in `app.js`.

### Disclaimer
This tool performs a lightweight auth reachability check only. It doesn’t exercise model quotas, permissions, or billing limits beyond verifying the token can access the models endpoint.

### CLI test with .env
You can validate a key from Node (outside the browser) using the included script.

1. Copy `ENV.EXAMPLE` to `.env` and put your real key:
```bash
cp ENV.EXAMPLE .env
```
2. Install deps and run the test:
```bash
npm install
npm run test:api
```
Exit codes:
- 0: Key valid (200) or potentially restricted (non-401)
- 1: Invalid (401)
- 2: Missing env var
- 3: Network error


