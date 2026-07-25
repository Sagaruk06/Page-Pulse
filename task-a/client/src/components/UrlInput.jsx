import { useState } from 'react';
import PropTypes from 'prop-types';
import './UrlInput.css';

/**
 * Minimal client-side URL validation.
 * Checks that the input can be parsed as an http/https URL with a dot in the host.
 * @param {string} str
 * @returns {boolean}
 */
function isValidUrl(str) {
  try {
    const u = new URL(str.startsWith('http') ? str : 'https://' + str);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * URL input form.
 *
 * Provides a text input and submit button with inline validation.
 * Validation runs both on the client side (before the API call) and is
 * re-validated server-side.
 */
export default function UrlInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    onAnalyze(url.trim());
  }

  return (
    <div className="url-card">
      <form onSubmit={handleSubmit}>
        <div className="url-input-group">
          <input
            type="text"
            placeholder="Enter a URL to analyze..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !url.trim()}>
            {loading ? (
              <>
                <span className="spinner" /> Analyzing
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
        {error && <div className="field-error">{error}</div>}
      </form>
    </div>
  );
}

UrlInput.propTypes = {
  /** Called with the trimmed URL string when the user submits. */
  onAnalyze: PropTypes.func.isRequired,
  /** Whether a request is currently in-flight. */
  loading: PropTypes.bool.isRequired,
};
