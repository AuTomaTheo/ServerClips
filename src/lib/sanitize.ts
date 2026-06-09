import sanitizeHtml from "sanitize-html";

export function sanitizeText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "br", "p"],
    allowedAttributes: {},
  }).trim();
}
