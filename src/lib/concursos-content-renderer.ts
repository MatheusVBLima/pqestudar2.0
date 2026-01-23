/**
 * Rich content renderer for /concursos pages.
 * Provides parity between preview (admin) and public rendering.
 * 
 * Pipeline:
 * 1. Detect if content is HTML or Markdown
 * 2. If Markdown → convert to HTML using marked (same config as MarkdownEditor)
 * 3. Sanitize with DOMPurify (whitelist approach)
 * 4. Return safe HTML for dangerouslySetInnerHTML
 */

import { marked, Renderer, Tokens } from "marked";
import DOMPurify from "dompurify";

// Configure marked with the same custom renderer as MarkdownEditor
const renderer = new Renderer();

renderer.heading = (token: Tokens.Heading) => {
  const { text, depth } = token;
  if (depth === 1 || depth === 2) {
    return `<h2 class="text-xl font-semibold mt-6 mb-3">${text}</h2>`;
  }
  if (depth === 3) {
    return `<h3 class="text-lg font-medium mt-4 mb-2">${text}</h3>`;
  }
  return `<h${depth} class="font-medium mt-3 mb-2">${text}</h${depth}>`;
};

renderer.paragraph = (token: Tokens.Paragraph) => {
  return `<p class="mb-4">${token.text}</p>`;
};

renderer.list = (token: Tokens.List) => {
  const tag = token.ordered ? "ol" : "ul";
  const className = token.ordered ? "list-decimal pl-6 mb-4" : "list-disc pl-6 mb-4";
  const body = token.items.map(item => renderer.listitem!(item)).join("");
  return `<${tag} class="${className}">${body}</${tag}>`;
};

renderer.listitem = (token: Tokens.ListItem) => {
  return `<li class="mb-1">${token.text}</li>`;
};

renderer.link = (token: Tokens.Link) => {
  return `<a href="${token.href}" class="underline hover:opacity-80" rel="nofollow noopener noreferrer" target="_blank">${token.text}</a>`;
};

renderer.blockquote = (token: Tokens.Blockquote) => {
  return `<blockquote class="border-l-4 border-muted-foreground/30 pl-4 italic my-4">${token.text}</blockquote>`;
};

renderer.code = (token: Tokens.Code) => {
  return `<pre class="bg-muted rounded-md p-4 overflow-x-auto my-4"><code class="text-sm">${token.text}</code></pre>`;
};

renderer.codespan = (token: Tokens.Codespan) => {
  return `<code class="bg-muted px-1.5 py-0.5 rounded text-sm">${token.text}</code>`;
};

renderer.hr = () => {
  return `<hr class="my-6 border-border" />`;
};

marked.use({ renderer, gfm: true, breaks: true });

// DOMPurify configuration - whitelist approach for security
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h2", "h3", "h4", "h5", "h6", 
    "p", "br", "hr",
    "ul", "ol", "li",
    "a", "strong", "em", "b", "i", "u",
    "code", "pre", "blockquote", 
    "span", "div",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "title",
    "class", "id",
    // Aria attributes for accessibility
    "aria-label", "aria-hidden", "aria-describedby",
  ],
  ALLOW_DATA_ATTR: true,
  // Add hooks to normalize external links
  ADD_ATTR: ["target", "rel"],
};

// Setup DOMPurify hook to enforce external link security
if (typeof window !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      // Check if external link
      try {
        const url = new URL(href, window.location.origin);
        const isExternal = url.origin !== window.location.origin;
        if (isExternal) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "nofollow noopener noreferrer");
        }
      } catch {
        // Invalid URL, leave as-is
      }
    }
  });
}

/**
 * Detect if content contains significant HTML tags (not just entities)
 */
function hasSignificantHtml(content: string): boolean {
  if (!content) return false;
  // Match opening tags like <h2>, <p>, <div> etc. (not just &lt; entities)
  return /<\s*(?:h[1-6]|p|div|ul|ol|li|a|strong|em|b|i|blockquote|br|hr|pre|code|span)\b[^>]*>/i.test(content);
}

/**
 * Convert Markdown to HTML using the same config as MarkdownEditor preview
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return marked.parse(markdown) as string;
}

/**
 * Sanitize HTML content using DOMPurify with whitelist
 */
function sanitize(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Main render function for /concursos rich content.
 * 
 * - If content is HTML → sanitize only
 * - If content is Markdown → convert to HTML then sanitize
 * 
 * @param content The raw content (HTML or Markdown)
 * @returns Safe HTML string for dangerouslySetInnerHTML
 */
export function renderRichContentConcursos(content: string | null | undefined): string {
  if (!content) return "";
  
  const trimmed = content.trim();
  if (!trimmed) return "";
  
  // Detect if content is already HTML
  if (hasSignificantHtml(trimmed)) {
    // Already HTML - just sanitize
    return sanitize(trimmed);
  }
  
  // Markdown content - convert then sanitize
  const html = markdownToHtml(trimmed);
  return sanitize(html);
}

/**
 * Render update text (atualizacoes) - shorter content, same pipeline
 */
export function renderUpdateText(text: string | null | undefined): string {
  return renderRichContentConcursos(text);
}

// Re-export for convenience
export { hasSignificantHtml, markdownToHtml, sanitize };
