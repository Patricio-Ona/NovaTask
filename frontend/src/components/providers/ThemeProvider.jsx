import { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";

export function ThemeProvider({ children }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return children;
}
