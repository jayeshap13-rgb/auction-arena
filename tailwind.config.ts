import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          black: "#061018",
          charcoal: "#0B1620",
          red: "#0E9F6E",
          neon: "#22D3A6",
          gold: "#D6A94A",
          muted: "#8EA0AE"
        }
      },
      boxShadow: {
        redglow: "0 0 34px rgba(34, 211, 166, 0.28)",
        goldglow: "0 0 30px rgba(214, 169, 74, 0.2)"
      },
      fontFamily: {
        display: ["Inter", "Segoe UI", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
