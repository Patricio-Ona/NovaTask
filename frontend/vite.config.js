import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_APP_BASE_PATH || "/",
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
    build: {
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
            charts: ["recharts"],
            dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
            ui: [
              "@radix-ui/react-avatar",
              "@radix-ui/react-separator",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "zustand",
            ],
          },
        },
      },
    },
  };
});
