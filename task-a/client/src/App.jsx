import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import UrlInput from './components/UrlInput';
import Report from './components/Report';
import ReportSkeleton from './components/ReportSkeleton';
import ErrorCard from './components/ErrorCard';
import RecentSearches from './components/RecentSearches';
import Footer from './components/Footer';
import './App.css';

/**
 * Base URL for the /api/analyze endpoint.
 *
 * In production (Vite build) the app is deployed separately from the API,
 * so we read the URL from an environment variable with a fallback.
 * In development, Vite's proxy forwards /api to the backend on localhost.
 */
const API_URL =
  import.meta.env.VITE_API_URL || '/api/analyze';

/** localStorage key for the recent searches list. */
const RECENT_KEY = 'pagePulseRecent';
/** Maximum number of recent searches to persist. */
const MAX_RECENT = 6;
/** localStorage key for the theme preference. */
const THEME_KEY = 'pagePulseTheme';

/**
 * Load the persisted list of recent searches.
 * @returns {string[]}
 */
function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Persist a list of recent searches, capped at MAX_RECENT.
 * @param {string[]} urls
 */
function saveRecent(urls) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(urls.slice(0, MAX_RECENT)));
}

/**
 * Root application component.
 *
 * Manages the top-level state (loading, results, error, recent searches,
 * theme) and orchestrates the URL analysis workflow.
 */
export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState(loadRecent);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (
      saved ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')
    );
  });
  const [toast, setToast] = useState(null);

  // --- Sync theme attribute & localStorage --------------------------------
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // --- Analyse a URL -------------------------------------------------------
  const analyze = useCallback(
    async (url) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        const result = await res.json();

        if (!res.ok) {
          setError(result.error || 'Something went wrong');
          return;
        }

        setData(result);

        // Add to recent searches (move to front, deduplicate)
        const updated = [url, ...recent.filter((u) => u !== url)];
        setRecent(updated);
        saveRecent(updated);
      } catch (err) {
        setError(
          'Could not reach the server. Make sure the backend is running.'
        );
      } finally {
        setLoading(false);
      }
    },
    [recent]
  );

  // --- Copy report as JSON to clipboard ------------------------------------
  async function handleCopy() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showToast('Copied to clipboard!');
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      showToast('Failed to copy');
    }
  }

  // --- Show toast notification (auto-dismiss after 2s) ----------------------
  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📡 Page Pulse</h1>
        <button
          className="theme-toggle"
          onClick={() =>
            setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
          }
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <UrlInput onAnalyze={analyze} loading={loading} />

      <RecentSearches searches={recent} onSelect={analyze} />

      {loading && <ReportSkeleton />}
      {error && <ErrorCard error={error} />}
      {data && !loading && <Report data={data} onCopy={handleCopy} />}

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </div>
  );
}

App.propTypes = {
  // App is the root — no props expected.
};
