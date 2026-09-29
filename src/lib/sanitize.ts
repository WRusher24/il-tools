import sanitizeHtml from "sanitize-html";

/**
 * Server-side HTML allowlist sanitizer (equivalent of Python's `bleach`).
 *
 * Every HTML string that reaches the DOM — including first-party authored
 * guide content — passes through here before rendering, closing stored-XSS
 * vectors (A03/A07 in OWASP terms). Only structural tags and safe attributes
 * survive; `javascript:` URLs, event handlers and `<script>` are stripped.
 */
export function sanitizeRichHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "strong",
      "b",
      "em",
      "i",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "div",
      "br",
      "hr",
      "figure",
      "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "rel", "target"],
      "*": ["class"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          // Neutralize reverse-tabnabbing on any author-supplied link.
          rel: "noopener noreferrer nofollow",
          target: attribs.target === "_blank" ? "_blank" : undefined as never,
        },
      }),
    },
  });
}

/** Plain-text escaping utility for interpolations into non-HTML contexts. */
export function escapeText(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
