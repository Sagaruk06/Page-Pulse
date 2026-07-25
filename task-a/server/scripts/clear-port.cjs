/**
 * Clears any stale process on the given port.
 * Used by the dev script to prevent EADDRINUSE on --watch restart.
 */
const { execSync } = require('child_process');
const port = process.argv[2] || '3001';

try {
  const stdout = execSync(
    `netstat -ano | findstr ":${port} " | findstr LISTENING`,
    { encoding: 'utf8', timeout: 3000 }
  );
  const lines = stdout.trim().split('\n').filter(Boolean);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parseInt(parts[parts.length - 1], 10);
    if (pid && !isNaN(pid)) {
      try {
        process.kill(pid);
        console.log(`Killed stale process ${pid} on port ${port}`);
      } catch {
        // Process already dead — fine
      }
    }
  }
} catch {
  // No process on the port — nothing to do
}
