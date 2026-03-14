const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NAV", "FOOTER", "HEADER", "NOSCRIPT", "SVG"]);

function extractDomText() {
  const parts = [];
  try {
    if (document.title) parts.push(document.title.trim());

    const headings = document.querySelectorAll("h1, h2");
    headings.forEach((h) => {
      const text = h.textContent?.trim();
      if (text && text.length > 2 && !parts.includes(text)) parts.push(text);
    });

    const paragraphs = document.querySelectorAll("p");
    let pCount = 0;
    for (const p of paragraphs) {
      if (pCount >= 3) break;
      let skip = false;
      let parent = p.parentElement;
      while (parent) {
        if (SKIP_TAGS.has(parent.tagName)) { skip = true; break; }
        parent = parent.parentElement;
      }
      if (skip) continue;

      const text = p.textContent?.trim();
      if (text && text.length > 10) { parts.push(text); pCount++; }
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute("content")?.trim();
      if (content && !parts.includes(content)) parts.push(content);
    }
  } catch {}

  const seen = new Set();
  const unique = [];
  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!seen.has(normalized)) { seen.add(normalized); unique.push(part); }
  }
  return unique.join(" | ").slice(0, 500);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_DOM_TEXT") {
    sendResponse({ domText: extractDomText() });
  }
  return false;
});
