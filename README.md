# 📡 Page Pulse

A web application that analyzes any URL and returns structured metadata — HTTP status, response time, page title, meta tags, heading counts, image accessibility, and word count.

Built for the **Digital Heroes Software Development Internship**.

---

## Project Structure

```
page-pulse/
├── task-a/                         # Application code
│   ├── server/                     # Express.js backend (ESM)
│   │   ├── index.js                # Server entry point
│   │   ├── routes/analyze.js       # POST /api/analyze
│   │   ├── services/
│   │   │   ├── fetcher.js          # HTTP client (Axios)
│   │   │   └── parser.js           # HTML parser (Cheerio)
│   │   ├── utils/
│   │   │   ├── validation.js       # URL validation
│   │   │   └── errors.js           # Custom error classes
│   │   └── scripts/
│   │       └── clear-port.cjs      # Dev port cleanup utility
│   ├── client/                     # React + Vite frontend
│   │   └── src/
│   │       ├── App.jsx             # Root component
│   │       ├── components/         # UI components
│   │       └── index.css / App.css # Styles
│   ├── .env.example               # Server env template
│   └── package.json
├── task-b/                         # Tests & documentation
│   ├── tests/                      # Vitest unit tests
│   ├── README.md                   # Full documentation
│   └── LOOM_SCRIPT.md              # Demo walkthrough
└── README.md                       # You are here
```

---

## Quick Start

```bash
# 1. Install dependencies
cd task-a/server && npm install
cd ../client && npm install
cd ../../task-b && npm install
cd ../task-a && npm install concurrently

# 2. Run both backend + frontend (one command)
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Run separately (two terminals)

```bash
# Terminal 1 — Backend (port 3001)
cd task-a/server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd task-a/client && npm run dev
```

### Run tests

```bash
cd task-b && npm test
```

---

## API

| Method | Endpoint           | Description                  |
|--------|--------------------|------------------------------|
| `POST` | `/api/analyze`     | Analyse a URL                |
| `GET`  | `/api/health`      | Health check                 |

See [task-b/README.md](task-b/README.md) for the full API contract.

---

## Environment Variables

| Variable        | Default            | Description                        |
|-----------------|--------------------|------------------------------------|
| `PORT`          | `3001`             | Backend HTTP port                  |
| `CORS_ORIGIN`   | `http://localhost:5173` | Allowed CORS origin            |
| `RATE_LIMIT_MAX` | `60`              | Max requests per minute            |
| `VITE_API_PORT`  | `3001`            | Backend port for Vite proxy        |
| `VITE_API_URL`   | `'/api/analyze'`  | Production API endpoint URL        |

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js, Express, Axios, Cheerio        |
| Frontend   | React 18, Vite                          |
| Tests      | Vitest (34 unit tests)                  |
| Security   | Helmet, express-rate-limit, CORS        |

---

## Design Decisions

1. **Cheerio over Puppeteer** — lightweight static HTML parsing; no headless browser overhead.
2. **Custom error classes** — typed errors (`TimeoutError`, `FetchError`, `NonHtmlError`) carry HTTP status codes for structured JSON responses.
3. **Separate task folders** — `task-a` (app) / `task-b` (tests + docs) keeps deliverables independent.

See [task-b/README.md](task-b/README.md) for the full write-up.

---

## Submission Notes

- Frontend deployed on **Vercel**: https://page-pulse.vercel.app
- Backend deployed on **Render**: https://page-pulse-api.onrender.com
- Loom demo script: [task-b/LOOM_SCRIPT.md](task-b/LOOM_SCRIPT.md)
