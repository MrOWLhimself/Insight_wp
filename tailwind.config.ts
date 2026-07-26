import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F3",
        ink: "#15161A",
        "ink-soft": "#4A4B52",
        rule: "#DEDAD0",
        orange: "#F97316",
        signal: "#EF4444",
        charcoal: "#181D29",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
        script: ["var(--font-script)", "cursive"],
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
