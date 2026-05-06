type RouteImporter = () => Promise<unknown>;

const routeImporters: Record<string, RouteImporter> = {
  "/login": () => import("@/pages/Login"),
  "/assine": () => import("@/pages/Assine"),
  "/sobre-pqestudar": () => import("@/pages/SobrePqEstudar"),
  "/premium": () => import("@/pages/premium/PremiumHome"),
  "/premium/upgrade": () => import("@/pages/premium/PremiumUpgrade"),
  "/admin": () => import("@/components/admin/dashboard/AdminLayout"),
};

const prefetchedRoutes = new Set<string>();
const inFlightPrefetches = new Map<string, Promise<unknown>>();

function normalizePath(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  return clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

function resolveImporter(path: string): RouteImporter | null {
  const normalizedPath = normalizePath(path);
  if (routeImporters[normalizedPath]) return routeImporters[normalizedPath];

  const prefixMatches = Object.keys(routeImporters)
    .filter((key) => normalizedPath.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length);

  if (prefixMatches.length === 0) return null;
  return routeImporters[prefixMatches[0]];
}

export function prefetchRouteChunk(path: string) {
  if (!path || path.startsWith("http")) return;

  const normalizedPath = normalizePath(path);
  if (prefetchedRoutes.has(normalizedPath)) return;

  const importer = resolveImporter(normalizedPath);
  if (!importer) return;

  if (inFlightPrefetches.has(normalizedPath)) return;

  const prefetchPromise = importer()
    .then(() => {
      prefetchedRoutes.add(normalizedPath);
    })
    .catch(() => {
      // Ignore prefetch errors to avoid impacting navigation.
    })
    .finally(() => {
      inFlightPrefetches.delete(normalizedPath);
    });

  inFlightPrefetches.set(normalizedPath, prefetchPromise);
}
