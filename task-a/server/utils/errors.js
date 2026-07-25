/**
 * Custom error classes for the Page Pulse API.
 *
 * Each error carries an HTTP status code and a machine-readable type string
 * so the frontend can respond appropriately without parsing the message.
 *
 * Hierarchy:
 *   PagePulseError (base)
 *   ├── TimeoutError   → 504 Gateway Timeout
 *   ├── FetchError     → 502 Bad Gateway (or upstream status)
 *   └── NonHtmlError   → 400 Bad Request
 */

/**
 * Base error for all application-level failures.
 * Extends the native Error with HTTP status and type metadata.
 */
export class PagePulseError extends Error {
  /**
   * @param {string} message  Human-readable description.
   * @param {number} [statusCode=500]  HTTP status to return.
   * @param {string} [type='UNKNOWN_ERROR']  Machine-readable error type.
   */
  constructor(message, statusCode = 500, type = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'PagePulseError';
    this.statusCode = statusCode;
    this.type = type;
  }
}

/**
 * The request to the target URL timed out.
 * Used when axios exceeds the configured timeout threshold.
 */
export class TimeoutError extends PagePulseError {
  /**
   * @param {string} url     The URL that timed out.
   * @param {number} timeout The timeout value in milliseconds.
   */
  constructor(url, timeout) {
    super(
      `Request timed out after ${timeout}ms: ${url}`,
      504,
      'TIMEOUT'
    );
    this.name = 'TimeoutError';
  }
}

/**
 * The upstream fetch failed for a reason other than timeout.
 * Covers DNS errors, connection refused, and non-2xx HTTP statuses.
 */
export class FetchError extends PagePulseError {
  /**
   * @param {string} url     The URL that was being fetched.
   * @param {number} status  HTTP status (0 if the request never reached the server).
   * @param {string} detail  Short description of the failure.
   */
  constructor(url, status, detail) {
    super(
      `Failed to fetch ${url} — ${detail}`,
      status || 502,
      'FETCH_ERROR'
    );
    this.name = 'FetchError';
  }
}

/**
 * The fetched resource is not HTML (e.g. a PDF, image, or binary file).
 * We only analyse HTML pages, so anything else is rejected.
 */
export class NonHtmlError extends PagePulseError {
  /**
   * @param {string} url         The URL that returned non-HTML content.
   * @param {string} contentType The Content-Type value received.
   */
  constructor(url, contentType) {
    super(
      `Expected HTML from ${url}, got ${contentType}`,
      400,
      'NON_HTML'
    );
    this.name = 'NonHtmlError';
  }
}
