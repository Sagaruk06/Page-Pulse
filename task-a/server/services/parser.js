/**
 * HTML parser that extracts structured metadata from raw HTML.
 *
 * Uses Cheerio (a lightweight jQuery-like library) to traverse the DOM
 * and pull out the fields the API contract requires: title, meta tags,
 * heading counts, image accessibility info, and approximate word count.
 *
 * Cheerio is deliberately chosen over Puppeteer — we only need static
 * HTML analysis, so a full headless browser would be wasted overhead.
 */

import * as cheerio from 'cheerio';

/**
 * Result of parsing a page's HTML.
 * @typedef {Object} ParseResult
 * @property {string|null}  title                <title> text, or null.
 * @property {string|null}  metaDescription      name="description" content, or null.
 * @property {string|null}  ogTitle              property="og:title" content, or null.
 * @property {number}       h1Count              Number of <h1> elements.
 * @property {number}       imagesWithoutAlt     Count of <img> with src but no alt.
 * @property {Array}        imagesWithoutAltList  List of { src } for auditing.
 * @property {number}       wordCount            Approximate body word count.
 */

/**
 * Parse raw HTML and return structured page metadata.
 *
 * @param   {string} html  The raw HTML string to parse.
 * @returns {ParseResult}
 */
export function parsePage(html) {
  const $ = cheerio.load(html);

  // --- Basic metadata ----------------------------------------------------
  const title = $('title').first().text().trim() || null;

  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null;

  const ogTitle =
    $('meta[property="og:title"]').attr('content')?.trim() || null;

  // --- Structure & accessibility -----------------------------------------
  const h1Count = $('h1').length;

  const imagesWithoutAlt = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt');
    // Only flag images that have a src but are missing meaningful alt text
    if (src && src.trim() && (!alt || alt.trim() === '')) {
      imagesWithoutAlt.push({ src: src.trim().slice(0, 200) });
    }
  });

  // --- Word count (excluding script/style content) -----------------------
  const text = $('body')
    .clone()
    .find('script, style, noscript, svg, code, pre')
    .remove()
    .end()
    .text();

  return {
    title,
    metaDescription,
    ogTitle,
    h1Count,
    imagesWithoutAlt: imagesWithoutAlt.length,
    imagesWithoutAltList: imagesWithoutAlt,
    wordCount: approximateWordCount(text),
  };
}

/**
 * Estimate the number of words in a text string.
 *
 * Handles multiple spaces, newlines, tabs, and punctuation without
 * artificially inflating the count.
 *
 * @param   {*}      text  The text to analyse (coerced to string).
 * @returns {number}       Approximate word count.
 *
 * @example
 * approximateWordCount('Hello world')      // => 2
 * approximateWordCount('')                 // => 0
 * approximateWordCount(null)               // => 0
 * approximateWordCount('hello\nworld\t!')  // => 3
 */
export function approximateWordCount(text) {
  if (!text || typeof text !== 'string') return 0;
  const cleaned = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
}
