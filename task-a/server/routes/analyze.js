/**
 * Route handler for POST /api/analyze.
 *
 * Orchestrates the full analysis pipeline:
 *   1. Validate the incoming URL.
 *   2. Fetch the page HTML.
 *   3. Parse and extract metadata.
 *   4. Return the structured result.
 *
 * Every known failure is caught and returned as a typed JSON error.
 * Unexpected errors fall through to the global error middleware in index.js.
 */

import { Router } from 'express';
import { validateUrl } from '../utils/validation.js';
import { fetchPage } from '../services/fetcher.js';
import { parsePage } from '../services/parser.js';
import { PagePulseError } from '../utils/errors.js';

const router = Router();

/**
 * POST /api/analyze
 *
 * Accepts a JSON body with a `url` field, validates it, fetches the
 * remote page, parses the HTML, and returns structured metadata.
 *
 * Request body:  { "url": "https://example.com" }
 *
 * Success (200): { url, httpStatus, responseTime, contentType, title, ... }
 * Error   (4xx): { error, type? }
 * Error   (5xx): { error }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;

    // --- Step 1: Validate ------------------------------------------------
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // --- Step 2: Fetch ---------------------------------------------------
    const { html, status, responseTime, contentType } = await fetchPage(validation.url);

    // --- Step 3: Parse ---------------------------------------------------
    const data = parsePage(html);

    // --- Step 4: Respond -------------------------------------------------
    res.json({
      url: validation.url,
      httpStatus: status,
      responseTime,
      contentType,
      ...data,
    });
  } catch (err) {
    // Known application errors → structured JSON with type
    if (err instanceof PagePulseError) {
      return res.status(err.statusCode).json({
        error: err.message,
        type: err.type,
      });
    }

    // Unexpected errors → generic 500 (don't leak internals)
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
