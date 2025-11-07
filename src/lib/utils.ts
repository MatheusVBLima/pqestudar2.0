// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escapa caracteres HTML perigosos.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitiza HTML de forma conservadora (sem dependências).
 * - Remove tags bloqueadas (script, style, iframe, etc)
 * - Remove atributos que iniciem com "on"
 * - Permite apenas atributos seguros em tags específicas
 * - Normaliza links e imagens
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  // Parseia para DOM seguro
  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, "text/html");

  // Tags proibidas / nunca renderizar
  const blockedTags = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);

  // Tags permitidas (lista branca)
  const allowedTags = new Set([
    "p",
    "br",
    "hr",
    "div",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "blockquote",
    "ul",
    "ol",
    "li",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "img",
  ]);

  // Atributos permitidos
  const globalAllowedAttrs = new Set(["title"]);
  const perTagAllowedAttrs: Record<string, Set<string>> = {
    a: new Set(["href", "title", "target", "rel"]),
    img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  };

  const walk = (node: Node) => {
    // Remove comentários
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Remove tags bloqueadas
      if (blockedTags.has(tag)) {
        el.parentNode?.removeChild(el);
        return;
      }

      // Se a tag não está na lista branca, "desembrulhar" (mantém o conteúdo)
      if (!allowedTags.has(tag)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        return;
      }

      // Limpa atributos
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();

        // Remove qualquer atributo "on*"
        if (name.startsWith("on")) {
          el.removeAttribute(attr.name);
          continue;
        }

        const allowedForTag = perTagAllowedAttrs[tag] || new Set<string>();
        const allowed = allowedForTag.has(name) || globalAllowedAttrs.has(name);

        if (!allowed) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Regras específicas por tag/atributo
        if (tag === "a" && name === "href") {
          const href = attr.value.trim();
          try {
            const url = new URL(href, window.location.origin);
            const ok = /^(https?:|mailto:)/i.test(url.protocol + "");
            if (!ok) el.removeAttribute("href");
          } catch {
            el.removeAttribute("href");
          }
          // Força segurança em links externos
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }

        if (tag === "img" && name === "src") {
          const src = attr.value.trim();
          try {
            const url = new URL(src, window.location.origin);
            const ok = /^https?:/i.test(url.protocol + "");
            if (!ok) el.removeAttribute("src");
          } catch {
            el.removeAttribute("src");
          }
          // Evita srcset/decoding/… maliciosos por simplicidade
          el.removeAttribute("srcset");
        }
      }
    }

    // Visita filhos
    for (const child of Array.from(node.childNodes)) {
      walk(child);
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

/**
 * Destaca termos de busca de forma segura.
 * - Escapa term e texto
 * - Usa <mark> no resultado
 * OBS: o retorno é HTML; renderize com dangerouslySetInnerHTML
 */
export function safeHighlight(text: string, term?: string): string {
  if (!term) return escapeHtml(text);

  // Escapa caracteres especiais do termo para RegExp
  const escapedTerm = term
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Escapa o texto base
  const safeText = escapeHtml(text);
  const regex = new RegExp(`(${escapedTerm})`, "gi");
  return safeText.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
}
