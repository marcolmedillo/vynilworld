import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0a0412",
        neon: {
          pink: "#ff2fb9",
          cyan: "#2ff3ff",
          gold: "#ffd166",
          violet: "#9d4dff",
        },
      },
      fontFamily: {
        // Rótulo tipo neón de club; se carga desde Google Fonts en app/layout.tsx
        sign: ["var(--font-sign)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-pink": "0 0 8px #ff2fb9, 0 0 24px #ff2fb9",
        "neon-cyan": "0 0 8px #2ff3ff, 0 0 24px #2ff3ff",
      },
    },
  },
  plugins: [],
};

export default config;
