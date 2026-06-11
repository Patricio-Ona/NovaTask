import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      theme: "dark",
      projectView: "kanban",
      calendarView: "month",
      setTheme: (theme) => set({ theme }),
      setProjectView: (projectView) => set({ projectView }),
      setCalendarView: (calendarView) => set({ calendarView }),
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
      }),
    }
  )
);
