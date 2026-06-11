/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Tahoma", "sans-serif"],
        display: ["Inter", "Segoe UI", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 45px rgba(2, 6, 23, 0.35)",
        card: "0 16px 34px rgba(15, 23, 42, 0.25)",
      },
      backgroundImage: {
        "app-grid":
          "linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px)",
        "primary-glow":
          "radial-gradient(circle at top left, rgba(99, 102, 241, 0.35), transparent 32%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.25), transparent 28%)",
      },
    },
  },
  plugins: [],
};
