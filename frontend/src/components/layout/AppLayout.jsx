import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="mx-auto w-[min(1480px,calc(100%-16px))] py-3 sm:w-[min(1480px,calc(100%-24px))] sm:py-4">
        <div className="xl:grid xl:grid-cols-[290px,1fr] xl:gap-5">
          <Sidebar onClose={() => setSidebarOpen(false)} open={sidebarOpen} />
          <main className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
            <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
