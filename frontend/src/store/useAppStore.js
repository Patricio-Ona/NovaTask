import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      theme: "dark",
      projectView: "kanban",
      calendarView: "month",
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setProjectView: (projectView) => set({ projectView }),
      setCalendarView: (calendarView) => set({ calendarView }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "novatask-ui-preferences",
      partialize: (state) => ({
        theme: state.theme,
        projectView: state.projectView,
        calendarView: state.calendarView,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
