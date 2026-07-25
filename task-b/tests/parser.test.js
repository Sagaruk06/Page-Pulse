import { describe, it, expect } from 'vitest';
import { parsePage, approximateWordCount } from '../../task-a/server/services/parser.js';

describe('approximateWordCount', () => {
  it('counts words in a sentence', () => {
    expect(approximateWordCount('hello world')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(approximateWordCount('')).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(approximateWordCount(null)).toBe(0);
  });

  it('returns 0 for whitespace only', () => {
    expect(approximateWordCount('   ')).toBe(0);
  });

  it('handles multiple spaces between words', () => {
    expect(approximateWordCount('hello    world')).toBe(2);
  });

  it('handles newlines and tabs', () => {
    expect(approximateWordCount('hello\nworld\tfoo')).toBe(3);
  });

  it('handles punctuation without extra spaces', () => {
    const result = approximateWordCount('hello, world! foo bar.');
    expect(result).toBe(4);
  });

  it('counts a single word', () => {
    expect(approximateWordCount('hello')).toBe(1);
  });
});

describe('parsePage', () => {
  it('extracts page title', () => {
    const html = '<html><head><title>Test Page</title></head><body></body></html>';
    const result = parsePage(html);
    expect(result.title).toBe('Test Page');
  });

  it('extracts meta description', () => {
    const html = '<html><head><meta name="description" content="A test page"></head><body></body></html>';
    const result = parsePage(html);
    expect(result.metaDescription).toBe('A test page');
  });

  it('returns null when no title exists', () => {
    const html = '<html><head></head><body></body></html>';
    const result = parsePage(html);
    expect(result.title).toBeNull();
  });

  it('counts h1 tags', () => {
    const html = '<body><h1>One</h1><h1>Two</h1></body>';
    const result = parsePage(html);
    expect(result.h1Count).toBe(2);
  });

  it('returns zero h1 when none exist', () => {
    const html = '<body><h2>Not an h1</h2></body>';
    const result = parsePage(html);
    expect(result.h1Count).toBe(0);
  });

  it('detects images without alt text', () => {
    const html = '<body><img src="logo.png"><img src="icon.png" alt="Icon"></body>';
    const result = parsePage(html);
    expect(result.imagesWithoutAlt).toBe(1);
  });

  it('ignores images with alt text', () => {
    const html = '<body><img src="pic.jpg" alt="A picture"></body>';
    const result = parsePage(html);
    expect(result.imagesWithoutAlt).toBe(0);
  });

  it('ignores images without src attribute', () => {
    const html = '<body><img alt="no src"></body>';
    const result = parsePage(html);
    expect(result.imagesWithoutAlt).toBe(0);
  });

  it('approximates word count from body text', () => {
    const html = '<body><p>Hello world this is a test</p></body>';
    const result = parsePage(html);
    expect(result.wordCount).toBe(6);
  });

  it('excludes script and style content from word count', () => {
    const html = '<body><p>Hello</p><script>var x = 1;</script><style>.cls{}</style></body>';
    const result = parsePage(html);
    expect(result.wordCount).toBe(1);
  });

  it('extracts og:title when present', () => {
    const html = '<html><head><meta property="og:title" content="OG Title"></head><body></body></html>';
    const result = parsePage(html);
    expect(result.ogTitle).toBe('OG Title');
  });

  it('handles completely empty html', () => {
    const result = parsePage('');
    expect(result.title).toBeNull();
    expect(result.h1Count).toBe(0);
    expect(result.wordCount).toBe(0);
  });
});
