import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
