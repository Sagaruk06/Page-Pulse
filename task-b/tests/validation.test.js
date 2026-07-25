import { describe, it, expect } from 'vitest';
import { validateUrl } from '../../task-a/server/utils/validation.js';

describe('validateUrl', () => {
  it('accepts a valid https url', () => {
    const result = validateUrl('https://example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com');
    expect(result.error).toBeNull();
  });

  it('adds https:// when protocol is missing', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com');
  });

  it('accepts http urls', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('http://example.com');
  });

  it('rejects empty string', () => {
    const result = validateUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects null', () => {
    const result = validateUrl(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects whitespace only', () => {
    const result = validateUrl('   ');
    expect(result.valid).toBe(false);
  });

  it('rejects url with credentials', () => {
    const result = validateUrl('https://user:pass@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('credentials');
  });

  it('rejects unsupported protocol', () => {
    const result = validateUrl('ftp://example.com');
    expect(result.valid).toBe(false);
  });

  it('rejects domain without dot', () => {
    const result = validateUrl('https://localhost');
    expect(result.valid).toBe(false);
  });

  it('rejects very long url', () => {
    const long = 'https://example.com/' + 'a'.repeat(2100);
    const result = validateUrl(long);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2048');
  });

  it('handles url with path', () => {
    const result = validateUrl('https://example.com/some/page');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com/some/page');
  });

  it('handles url with query params', () => {
    const result = validateUrl('https://example.com/?q=test&lang=en');
    expect(result.valid).toBe(true);
  });

  it('trims whitespace around url', () => {
    const result = validateUrl('  https://example.com  ');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com');
  });

  it('rejects undefined', () => {
    const result = validateUrl(undefined);
    expect(result.valid).toBe(false);
  });
});
