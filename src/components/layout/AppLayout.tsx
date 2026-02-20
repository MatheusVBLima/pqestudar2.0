import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { GlobalSeo } from "@/components/seo/GlobalSeo";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <GlobalSeo />
      <Navbar />
      <div className="flex-1 flex flex-col pt-16">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
