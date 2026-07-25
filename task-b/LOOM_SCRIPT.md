# 🎥 Page Pulse — Loom Demo Script (2-3 min)

## Intro (0:00 – 0:20)

"Hi, this is [your name]. I'm presenting Page Pulse — a URL analysis tool I built for the Digital Heroes training task.

The project has two parts: Task A is the actual application — a React frontend with an Express backend — and Task B has the unit tests and documentation."

---

## Task A — Backend Demo (0:20 – 1:00)

"I'll start the backend server and the frontend together."

*[Show terminal starting server + browser]*

"The backend runs on port 3001. There's a single POST endpoint at `/api/analyze` — you send a URL, it fetches the page, parses the HTML with Cheerio, and returns structured metadata including HTTP status, response time, page title, H1 count, images missing alt text, and word count."

*[Quick curl or show code briefly]*

---

## Frontend Demo (1:00 – 1:40)

*[Switch to browser]*

"Here's the frontend. I'll analyze example.com."

*[Type https://example.com, click Analyze, show loading skeleton]*

"The skeleton loader shows while the request is in progress — no jarring layout shifts."

*[Results appear]*

"We get a green success badge, the URL, response time, title, H1 tags, image accessibility info, word count — all laid out in a clean grid. There's also a Copy JSON button to grab the raw data.

If I try an invalid URL like 'abc' —"

*[Type invalid URL]*

"— it shows a clear error message on the client itself before even sending a request. The server never crashes, thanks to centralized error handling."

---

## Dark Mode & Recent Searches (1:40 – 2:00)

"I also added dark mode — just click the toggle in the top right."

*[Toggle dark mode]*

"Recent searches are saved in localStorage, so you can quickly re-analyze a URL you already checked."

*[Click a recent search]*

---

## Task B — Tests & Docs (2:00 – 2:30)

"Moving to Task B — I wrote 34 unit tests using Vitest. Let me run them."

*[Show terminal — npm test, all green]*

"14 tests for URL validation — checking edge cases like missing protocol, credentials in URLs, long URLs. 20 tests for the parser — verifying title extraction, meta tags, H1 count, alt text detection, word count with various edge cases."

"The README includes full API documentation, installation steps, folder structure, three design decisions, and the required AI usage statement."

---

## Closing (2:30 – 3:00)

"You can find the full project on GitHub with the frontend deployed on Vercel and the backend on Render.

That's Page Pulse — thanks for watching!"

