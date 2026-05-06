import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { RouteSuspense } from "./route-fallbacks";
import { MANAGED_ROUTES, fetchPageSettingsByRoute } from "@/hooks/usePageSettings";

export function AppLayout() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const connection = typeof navigator !== "undefined"
      ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      : undefined;

    if (connection?.saveData) return;

    const warmup = () => {
      // Warm up page settings cache to avoid first-visit hero skeleton/flicker.
      for (const route of MANAGED_ROUTES) {
        if (route === "/") continue;
        queryClient.prefetchQuery({
          queryKey: ["page_settings", route],
          queryFn: () => fetchPageSettingsByRoute(route),
          staleTime: 5 * 60 * 1000,
        });
      }
    };

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    timeoutId = window.setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = (window as Window & {
          requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        }).requestIdleCallback(() => warmup(), { timeout: 5000 });
      } else {
        warmup();
      }
    }, 8000);

    return () => {
      if (idleId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as Window & {
          cancelIdleCallback: (handle: number) => void;
        }).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <GlobalSeo />
      <Navbar />
      <div className="flex-1 flex flex-col pt-16">
        <RouteSuspense kind="public">
          <Outlet />
        </RouteSuspense>
      </div>
      <Footer />
    </div>
  );
}
