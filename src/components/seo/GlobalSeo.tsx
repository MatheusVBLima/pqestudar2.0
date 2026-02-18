import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://pqestudar.com.br";

/**
 * Builds canonical URL: baseUrl + pathname (no trailing slash except root, no query/hash).
 */
function buildCanonical(pathname: string): string {
  // Root keeps trailing slash; all others strip it
  const clean = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return `${BASE_URL}${clean}`;
}

export interface JsonLdData {
  /** Page type determines which schema is injected */
  pageType?: "website" | "itemList" | "article" | "none";
  /** For "website" / Organization */
  siteName?: string;
  logoUrl?: string;
  sameAs?: string[];
  /** For "article" */
  headline?: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
  /** For "itemList" */
  items?: Array<{ name: string; url: string }>;
}

function buildJsonLd(canonical: string, data: JsonLdData): object[] | null {
  const type = data.pageType ?? "none";
  if (type === "none") return null;

  if (type === "website") {
    const schemas: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: data.siteName || "PqEstudar",
        url: BASE_URL,
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: data.siteName || "PqEstudar",
        url: BASE_URL,
        ...(data.logoUrl ? { logo: data.logoUrl } : {}),
        ...(data.sameAs?.length ? { sameAs: data.sameAs } : {}),
      },
    ];
    return schemas;
  }

  if (type === "itemList") {
    if (!data.items?.length) return null;
    return [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: data.items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
        })),
      },
    ];
  }

  if (type === "article") {
    const article: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.headline || "",
      url: canonical,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      author: {
        "@type": "Organization",
        name: data.authorName || "PqEstudar",
        url: BASE_URL,
      },
    };
    if (data.description) article.description = data.description;
    if (data.datePublished) article.datePublished = data.datePublished;
    if (data.dateModified) article.dateModified = data.dateModified;
    if (data.imageUrl) article.image = data.imageUrl;
    return [article];
  }

  return null;
}

interface GlobalSeoProps {
  jsonLd?: JsonLdData;
}

/**
 * Injects canonical link + optional JSON-LD into <head>.
 * Place in every layout; pages can override JSON-LD via props.
 * Canonical is always injected based on current pathname.
 */
export function GlobalSeo({ jsonLd }: GlobalSeoProps) {
  const { pathname } = useLocation();
  const canonical = buildCanonical(pathname);

  const schemas = jsonLd ? buildJsonLd(canonical, jsonLd) : null;

  // Inject canonical directly via DOM to guarantee it appears
  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);
    return () => {
      const existing = document.querySelector('link[rel="canonical"]');
      if (existing) existing.remove();
    };
  }, [canonical]);

  return (
    <>
      {schemas?.map((schema, i) => (
        <Helmet key={i}>
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>
      ))}
    </>
  );
}

export { BASE_URL, buildCanonical };
