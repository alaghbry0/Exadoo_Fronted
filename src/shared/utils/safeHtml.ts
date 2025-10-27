// utils/safeHtml.ts
import DOMPurify from "isomorphic-dompurify";

export const sanitizeHtml = (html: string) => ({
  __html: DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    FORBID_TAGS: ["script", "style"],
  }),
});
