/**
 * Page Pulse API — Express server entry point.
 *
 * - Health check at  GET  /api/health
 * - URL analysis at  POST /api/analyze  (delegated to routes/analyze.js)
 * - 404 catch-all for unknown routes
 * - Global error handler so no uncaught exception crashes the process
 * - Automatic port fallback when the preferred port is in use
 *
 * Environment variables:
 *   PORT           — HTTP port (default 3001)
 *   NODE_ENV       — "development" exposes error detail on 5xx responses
 *   CORS_ORIGIN    — Allowed origin for CORS (default http://localhost:5173)
 *   RATE_LIMIT_WIN — Rate-limit window in ms (default 60000 / 1 minute)
 *   RATE_LIMIT_MAX — Max requests per window (default 60)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import analyzeRouter from './routes/analyze.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT, 10) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WIN, 10) || 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 60;

// Validate critical configuration on startup
function validateConfig() {
  const warnings = [];

  if (PORT < 1024 && PORT !== 3001 && PORT !== 5173) {
    // Ports below 1024 require root — warn but don't block
    warnings.push(`Port ${PORT} may require elevated privileges`);
  }

  if (CORS_ORIGIN === '*') {
    // Wide-open CORS is a security risk in production
    warnings.push('CORS_ORIGIN is set to "*" — restrict this in production');
  }

  if (RATE_LIMIT_MAX > 1000) {
    warnings.push(`RATE_LIMIT_MAX is ${RATE_LIMIT_MAX} — this is very permissive`);
  }

  if (!process.env.PORT) {
    // Expected in dev — just informational
    warnings.push('PORT not set, defaulting to 3001');
  }

  for (const w of warnings) {
    console.warn('⚠️  %s', w);
  }
}

validateConfig();

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------

const app = express();

// Security headers (helmet)
app.use(helmet());

// CORS — restrict to the frontend origin in production
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// Body parsing with a size limit to prevent large-payload attacks
app.use(express.json({ limit: '10kb' }));

// Rate limiting — shared across all routes
app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  })
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/health
 * Lightweight health-check endpoint for monitoring and proxy verification.
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// URL analysis endpoint — delegates to the analyse router
app.use('/api', analyzeRouter);

// --- 404 catch-all -------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- Global error handler ------------------------------------------------
// Express recognises a 4-arg middleware as an error handler.
/* eslint-disable-next-line no-unused-vars */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    // Only expose the error detail in development so we don't leak internals
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

/**
 * Attempt to start the server on the configured port.
 * If the port is busy (EADDRINUSE), increment and retry up to MAX_FALLBACK
 * attempts so the process never crashes during --watch restarts or CI.
 */
const MAX_FALLBACK = 10;

function startServer(port, attempt = 0) {
  const server = app.listen(port, () => {
    if (port !== PORT) {
      console.warn(
        `⚠️  Port ${PORT} was in use — fell back to port ${port}.\n` +
        `   Set VITE_API_PORT=${port} when starting the frontend,` +
        ` or kill the process holding port ${PORT}.`
      );
    }
    console.log(`Page Pulse API running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_FALLBACK) {
      const next = port + 1;
      console.warn(`Port ${port} in use, trying ${next}…`);
      server.close(() => startServer(next, attempt + 1));
    } else if (err.code === 'EADDRINUSE') {
      console.error(
        `Exhausted ${MAX_FALLBACK} fallback ports (${PORT}–${PORT + MAX_FALLBACK}).\n` +
        'Please free a port manually and restart.'
      );
      process.exit(1);
    } else {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);

export default app;
