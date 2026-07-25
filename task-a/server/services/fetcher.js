/**
 * HTTP client for fetching remote pages.
 *
 * Uses axios with sensible limits (timeout, max size, redirect cap)
 * and wraps errors into the application's custom error classes so the
 * route handler can return structured JSON regardless of failure mode.
 */

import axios from 'axios';
import { TimeoutError, FetchError, NonHtmlError } from '../utils/errors.js';

/** Maximum time (ms) to wait for a response. */
const TIMEOUT = 10_000;

/** Maximum response body size (bytes).  5 MB. */
const MAX_SIZE = 5 * 1024 * 1024;

/** Number of HTTP redirects to follow before giving up. */
const MAX_REDIRECTS = 5;

/**
 * Result of a successful page fetch.
 * @typedef {Object} FetchResult
 * @property {string}  html         The raw HTML string.
 * @property {number}  status       HTTP status code.
 * @property {number}  responseTime Round-trip time in milliseconds.
 * @property {string}  contentType  MIME type (e.g. "text/html").
 */

/**
 * Fetch a remote URL and return its HTML content plus metadata.
 *
 * @param   {string} url  The fully-qualified URL to fetch.
 * @returns {Promise<FetchResult>}
 * @throws  {TimeoutError}  If the request takes longer than TIMEOUT.
 * @throws  {FetchError}    If the request fails (network, DNS, non-2xx).
 * @throws  {NonHtmlError}  If the response is not HTML.
 */
export async function fetchPage(url) {
  const start = performance.now();

  try {
    const res = await axios.get(url, {
      timeout: TIMEOUT,
      maxRedirects: MAX_REDIRECTS,
      responseType: 'text',
      maxContentLength: MAX_SIZE,
      headers: {
        'User-Agent': 'PagePulse/1.0 (URL Analyzer)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const responseTime = Math.round(performance.now() - start);
    const contentType = res.headers['content-type'] || '';

    // Guard: only HTML content is meaningful for our analysis.
    // We check both the Content-Type header and the raw leading characters
    // as a fallback for misconfigured servers that send HTML without the
    // correct Content-Type.
    const isHtml =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml');

    if (!isHtml && !res.data?.trim()?.startsWith('<!')) {
      throw new NonHtmlError(url, contentType || 'unknown');
    }

    return {
      html: res.data,
      status: res.status,
      responseTime,
      contentType: contentType.split(';')[0] || 'text/html',
    };
  } catch (err) {
    // Re-throw application errors as-is
    if (err instanceof NonHtmlError) throw err;

    // Timeout detection (ECONNABORTED is axios-specific, but also check the message)
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new TimeoutError(url, TIMEOUT);
    }

    // HTTP error status (4xx / 5xx)
    if (err.response) {
      throw new FetchError(url, err.response.status, `HTTP ${err.response.status}`);
    }

    // DNS resolution failure
    if (err.code === 'ENOTFOUND') {
      throw new FetchError(url, 0, 'Domain not found');
    }

    // Connection refused
    if (err.code === 'ECONNREFUSED') {
      throw new FetchError(url, 0, 'Connection refused');
    }

    // Catch-all for anything else
    throw new FetchError(url, 0, err.message || 'Unknown error');
  }
}
