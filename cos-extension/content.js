/**
 * COS Chrome Extension — Content Script (DOM Text Extractor)
 *
 * Extracts visible, meaningful text from the current page.
 * Priority order: title → h1/h2 → first 3 <p> → meta description
 * Skips: <script>, <style>, <nav>, <footer>, <header>
 * Responds to GET_DOM_TEXT message from background.js
 */

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NAV", "FOOTER", "HEADER", "NOSCRIPT", "SVG"]);

function extractDomText() {
  const parts = [];

  try {
    // 1. Page title
    if (document.title) {
      parts.push(document.title.trim());
    }

    // 2. Headings: h1 and h2
    const headings = document.querySelectorAll("h1, h2");
    headings.forEach((h) => {
      const text = h.textContent?.trim();
      if (text && text.length > 2 && !parts.includes(text)) {
        parts.push(text);
      }
    });

    // 3. First 3 paragraphs
    const paragraphs = document.querySelectorAll("p");
    let pCount = 0;
    for (const p of paragraphs) {
      if (pCount >= 3) break;

      // Skip if inside a skipped parent
      let skip = false;
      let parent = p.parentElement;
      while (parent) {
        if (SKIP_TAGS.has(parent.tagName)) {
          skip = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (skip) continue;

      const text = p.textContent?.trim();
      if (text && text.length > 10) {
        parts.push(text);
        pCount++;
      }
    }

    // 4. Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute("content")?.trim();
      if (content && !parts.includes(content)) {
        parts.push(content);
      }
    }
  } catch {
    // Page with no readable content — return empty
  }

  // Deduplicate and trim to 500 chars
  const seen = new Set();
  const unique = [];
  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(part);
    }
  }

  return unique.join(" | ").slice(0, 500);
}


// ─── Message Listener ───────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_DOM_TEXT") {
    const domText = extractDomText();
    sendResponse({ domText });
  }
  return false; // synchronous response
});
