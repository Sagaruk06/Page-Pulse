/**
 * URL validation and normalisation.
 *
 * Accepts a raw user input and returns either a validated, normalised URL
 * or a clear error message.  The normaliser prepends https:// when no
 * protocol is present, so users can type "example.com" without the scheme.
 */

/** Maximum allowed URL length (in characters) after trimming. */
const MAX_URL_LENGTH = 2048;

/**
 * Result of a URL validation.
 * @typedef {Object} ValidationResult
 * @property {boolean}  valid  Whether the input is a usable URL.
 * @property {string|null}  url   The normalised URL, or null on failure.
 * @property {string|null}  error Human-readable error, or null on success.
 */

/**
 * Validates and normalises a URL input from the user.
 *
 * @param   {*} input  The raw value from the request body.
 * @returns {ValidationResult}
 *
 * @example
 * validateUrl('example.com')
 * // => { valid: true, url: 'https://example.com', error: null }
 *
 * @example
 * validateUrl('not-a-domain')
 * // => { valid: false, url: null, error: 'Invalid domain in URL' }
 */
export function validateUrl(input) {
  // --- Reject missing / non-string input -----------------------------------
  if (!input || typeof input !== 'string') {
    return { valid: false, url: null, error: 'URL is required' };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, url: null, error: 'URL is required' };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      valid: false,
      url: null,
      error: `URL exceeds maximum length of ${MAX_URL_LENGTH} characters`,
    };
  }

  // --- Normalise: prepend https:// when protocol is missing ----------------
  let normalised = trimmed;
  if (!/^https?:\/\//i.test(normalised)) {
    normalised = 'https://' + normalised;
  }

  // --- Parse and validate --------------------------------------------------
  try {
    const parsed = new URL(normalised);

    // Only http / https are supported
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        valid: false,
        url: null,
        error: 'Only HTTP and HTTPS URLs are supported',
      };
    }

    // Embedded credentials (user:pass@host) are a security risk
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        url: null,
        error: 'URLs with embedded credentials are not supported',
      };
    }

    // Require at least one dot in the hostname to catch bare words
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        url: null,
        error: 'Invalid domain in URL',
      };
    }

    return { valid: true, url: normalised, error: null };
  } catch {
    // URL() constructor throws on truly malformed input
    return {
      valid: false,
      url: null,
      error:
        'Invalid URL format. Please enter a valid URL (e.g., https://example.com)',
    };
  }
}
