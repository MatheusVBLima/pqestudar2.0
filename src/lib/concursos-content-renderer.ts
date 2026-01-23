/**
 * Rich content renderer for /concursos pages.
 * Provides parity between preview (admin) and public rendering.
 * 
 * Pipeline:
 * 1. Detect if content is HTML or Markdown
 * 2. If Markdown → convert to HTML using markdown-it (html:false, linkify:true)
 * 3. Sanitize with sanitize-html (whitelist approach)
 * 4. Return safe HTML for dangerouslySetInnerHTML
 */

import MarkdownIt from "markdown-it";
import sanitizeHtmlLib from "sanitize-html";

// Configure markdown-it: disable raw HTML, enable linkify
const md = new MarkdownIt({
  html: false,        // Disable raw HTML input for security
  linkify: true,      // Auto-convert URLs to links
  breaks: true,       // Convert \n to <br>
  typographer: false, // Disable smart quotes/dashes
});

// sanitize-html configuration - strict whitelist
const SANITIZE_CONFIG: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "strong", "b", "em", "i",
    "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a",
    "blockquote",
    "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    "*": ["class"],
  },
  // Enforce secure link attributes
  transformTags: {
    a: (tagName, attribs) => {
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          href: attribs.href || "",
          target: "_blank",
          rel: "nofollow noopener noreferrer",
        },
      };
    },
    // Map H1 to H2 for SEO hierarchy
    h1: () => ({
      tagName: "h2",
      attribs: { class: "text-xl font-semibold mt-6 mb-3" },
    }),
    h2: () => ({
      tagName: "h2",
      attribs: { class: "text-xl font-semibold mt-6 mb-3" },
    }),
    h3: () => ({
      tagName: "h3",
      attribs: { class: "text-lg font-medium mt-4 mb-2" },
    }),
    p: () => ({
      tagName: "p",
      attribs: { class: "mb-4" },
    }),
    ul: () => ({
      tagName: "ul",
      attribs: { class: "list-disc pl-6 mb-4" },
    }),
    ol: () => ({
      tagName: "ol",
      attribs: { class: "list-decimal pl-6 mb-4" },
    }),
    li: () => ({
      tagName: "li",
      attribs: { class: "mb-1" },
    }),
    blockquote: () => ({
      tagName: "blockquote",
      attribs: { class: "border-l-4 border-muted-foreground/30 pl-4 italic my-4" },
    }),
    pre: () => ({
      tagName: "pre",
      attribs: { class: "bg-muted rounded-md p-4 overflow-x-auto my-4" },
    }),
    code: () => ({
      tagName: "code",
      attribs: { class: "bg-muted px-1.5 py-0.5 rounded text-sm" },
    }),
    hr: () => ({
      tagName: "hr",
      attribs: { class: "my-6 border-border" },
    }),
  },
  // Remove all other tags
  disallowedTagsMode: "discard",
};

/**
 * Detect if content contains significant HTML tags (not just entities)
 */
function hasSignificantHtml(content: string): boolean {
  if (!content) return false;
  // Match opening tags like <h2>, <p>, <div> etc. (not just &lt; entities)
  return /<\s*(?:h[1-6]|p|div|ul|ol|li|a|strong|em|b|i|blockquote|br|hr|pre|code|span)\b[^>]*>/i.test(content);
}

/**
 * Convert Markdown to HTML using markdown-it
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return md.render(markdown);
}

/**
 * Sanitize HTML content using sanitize-html with whitelist
 */
function sanitize(html: string): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, SANITIZE_CONFIG);
}

/**
 * Main render function for /concursos rich content.
 * Unified function that handles both legacy HTML and Markdown content.
 * 
 * - If content starts with < (HTML) → sanitize only
 * - If content is Markdown → convert to HTML then sanitize
 * 
 * @param content The raw content (HTML or Markdown)
 * @returns Safe HTML string for dangerouslySetInnerHTML
 */
export function renderRichContentConcursos(content: string | null | undefined): string {
  if (!content) return "";
  
  const trimmed = content.trim();
  if (!trimmed) return "";
  
  // Detect if content is already HTML (starts with < or has significant HTML tags)
  if (trimmed.startsWith("<") || hasSignificantHtml(trimmed)) {
    // Already HTML - just sanitize for compatibility with legacy records
    return sanitize(trimmed);
  }
  
  // Markdown content - convert then sanitize
  const html = markdownToHtml(trimmed);
  return sanitize(html);
}

/**
 * Alias for renderRichContentConcursos - unified entry point
 */
export function renderContentUnified(content: string | null | undefined): string {
  return renderRichContentConcursos(content);
}

/**
 * Render update text (atualizacoes) - shorter content, same pipeline
 */
export function renderUpdateText(text: string | null | undefined): string {
  return renderRichContentConcursos(text);
}

// Re-export for convenience
export { hasSignificantHtml, markdownToHtml, sanitize };
