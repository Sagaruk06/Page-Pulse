# 📡 Page Pulse

A web application that analyzes any URL and returns structured metadata — HTTP status, response time, page title, meta tags, heading counts, image accessibility, and word count.

Built for **Digital Heroes Training Task**.

## Folder Structure

```
page-pulse/
├── task-a/                         # Application code
│   ├── server/                     # Express.js backend
│   │   ├── index.js                # Server entry point
│   │   ├── routes/analyze.js       # POST /api/analyze
│   │   ├── services/
│   │   │   ├── fetcher.js          # HTTP client (Axios)
│   │   │   └── parser.js           # HTML parser (Cheerio)
│   │   └── utils/
│   │       ├── validation.js       # URL validation
│   │       └── errors.js           # Custom errors
│   └── client/                     # React + Vite frontend
│       └── src/
│           ├── App.jsx             # Root component
│           ├── components/
│           │   ├── UrlInput.jsx    # URL form
│           │   ├── Report.jsx      # Results display
│           │   ├── ReportSkeleton.jsx
│           │   ├── ErrorCard.jsx
│           │   ├── RecentSearches.jsx
│           │   └── Footer.jsx
│           ├── index.css           # Global styles + dark mode
│           └── App.css             # Component styles
└── task-b/                         # Tests & documentation
    ├── tests/
    │   ├── parser.test.js          # Parser unit tests
    │   └── validation.test.js      # Validation unit tests
    ├── vitest.config.js
    └── README.md
```

## Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/page-pulse.git
cd page-pulse

# Install backend dependencies
cd task-a/server && npm install

# Install frontend dependencies
cd ../client && npm install

# Install test dependencies
cd ../../task-b && npm install
```

## Running

```bash
# Start the backend (from project root or task-a/server)
cd task-a/server && npm run dev

# Start the frontend (in a separate terminal)
cd task-a/client && npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3001`.

## API Contract

### `POST /api/analyze`

Analyzes a URL and returns page metadata.

**Request:**

```json
{
  "url": "https://example.com"
}
```

**Success Response (200):**

```json
{
  "url": "https://example.com",
  "httpStatus": 200,
  "responseTime": 231,
  "contentType": "text/html",
  "title": "Example Domain",
  "metaDescription": null,
  "ogTitle": null,
  "h1Count": 1,
  "imagesWithoutAlt": 0,
  "imagesWithoutAltList": [],
  "wordCount": 14
}
```

**Error Responses:**

| Status | Type | Example |
|--------|------|---------|
| 400 | Invalid URL | `{ "error": "Invalid URL format" }` |
| 400 | NON_HTML | `{ "error": "Expected HTML from ...", "type": "NON_HTML" }` |
| 504 | TIMEOUT | `{ "error": "Request timed out...", "type": "TIMEOUT" }` |
| 502 | FETCH_ERROR | `{ "error": "Failed to fetch...", "type": "FETCH_ERROR" }` |

### `GET /api/health`

```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

## Design Decisions

### 1. Separate task folders (task-a / task-b)

The project is split into two clear directories — one for the application, one for tests and documentation. This makes it easy for reviewers to evaluate each deliverable independently. It also prevents test dependencies from mixing with production code.

### 2. Cheerio over Puppeteer for HTML parsing

Cheerio is a lightweight jQuery-like parser that works with static HTML. Puppeteer is more powerful but runs a full headless browser — slower and heavier. Since we only extract metadata (title, meta tags, headings, alt text), static parsing is sufficient. This also avoids memory issues from loading heavy JavaScript-rendered pages.

### 3. Express error middleware for fail-safe operation

All errors — network failures, timeouts, invalid HTML — are caught by a centralized error handler. Custom error classes carry HTTP status codes so the right response goes to the client without crashing the server. The app stays up even when given a broken URL.

## Running Tests

```bash
cd task-b
npm test
```

Or in watch mode:

```bash
cd task-b
npm run test:watch
```

## Deployment

| Service | Link |
|---------|------|
| Frontend (Vercel) | https://page-pulse.vercel.app |
| Backend (Render)  | https://page-pulse-api.onrender.com |
| GitHub            | https://github.com/yourusername/page-pulse |

## AI Usage

I used AI to brainstorm the initial architecture, review edge cases for URL parsing, and improve the README structure. I then implemented, tested, and refined the solution myself, making changes to the error handling, UI layout, and parsing logic based on my own testing rather than using AI-generated code directly.
