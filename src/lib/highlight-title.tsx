import React from "react";

/**
 * Renders a title string with **bold** markdown-style markers
 * as highlighted <span> elements with the brand gradient.
 *
 * Convention: wrap words in `**` in page_settings.header_title
 * e.g. "Aprenda, Organize e **Evolua** com as Ferramentas Certas"
 */
export function renderHighlightedTitle(title: string): React.ReactNode {
  if (!title.includes("**")) return title;

  const parts = title.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
