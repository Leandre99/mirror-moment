import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        cream: "#FAF6F1",
        ink: "#1C1917",
        clay: { 50: "#FBF3F0", 100: "#F6E4DD", 200: "#EDC8BA", 300: "#E0A591", 400: "#CF7F67", 500: "#B9614A", 600: "#9C4B38", 700: "#7E3B2D", 800: "#632F25", 900: "#4A241D" },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,25,23,0.04), 0 12px 32px -16px rgba(28,25,23,0.12)",
        lift: "0 2px 4px rgba(28,25,23,0.04), 0 24px 48px -20px rgba(28,25,23,0.22)",
      },
    },
  },
  plugins: [],
};
export default config;
