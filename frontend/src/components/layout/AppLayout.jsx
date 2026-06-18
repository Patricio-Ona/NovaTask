import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleSidebarCollapsed);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="mx-auto w-[min(1480px,calc(100%-16px))] py-3 sm:w-[min(1480px,calc(100%-24px))] sm:py-4">
        <div className={`xl:grid xl:gap-5 ${sidebarCollapsed ? "xl:grid-cols-[1fr]" : "xl:grid-cols-[290px,1fr]"}`}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={toggleSidebarCollapsed}
            open={sidebarOpen}
          />
          <main className="min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
            <Topbar
              onOpenSidebar={() => setSidebarOpen(true)}
              onToggleSidebarCollapse={toggleSidebarCollapsed}
              sidebarCollapsed={sidebarCollapsed}
            />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
