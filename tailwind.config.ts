import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* NexalField identity */
        blush: {
          50: "#FEF8FB",
          100: "#F8D7E6",
          200: "#F3C5D8",
          300: "#E9A9C3",
          400: "#D984A6",
          500: "#C4628A",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#5B5B5B",
          faint: "#8A8A8A",
        },
        line: "#ECECEC",
        surface: "#FFFFFF",
        canvas: "#FAFAFA",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,16,16,0.04), 0 8px 24px -12px rgba(16,16,16,0.12)",
        lift: "0 2px 4px rgba(16,16,16,0.05), 0 18px 40px -18px rgba(16,16,16,0.22)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 120ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
