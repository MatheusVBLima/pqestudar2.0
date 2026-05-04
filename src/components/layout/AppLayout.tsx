import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { RouteSuspense } from "./route-fallbacks";

export function AppLayout() {
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
