import type { Config } from "tailwindcss";

// Design system tokens. Colors are nature-inspired: greens, white, charcoal.
// These tokens are referenced by component classes via Tailwind utilities.
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand palette
        leaf: {
          50: "#f2faf3",
          100: "#dff3e3",
          200: "#bce6c5",
          300: "#8ed3a1",
          400: "#58b873",
          500: "#339c55",
          600: "#237d40",
          700: "#1c6434",
          800: "#194f2d",
          900: "#154127",
          950: "#0a2415",
        },
        charcoal: {
          50: "#f6f7f7",
          100: "#e7e9e9",
          200: "#cdd2d2",
          300: "#a6aeae",
          400: "#788080",
          500: "#5b6363",
          600: "#474e4e",
          700: "#3a4040",
          800: "#2b3030",
          900: "#1f2323",
          950: "#121515",
        },
        // Semantic status colors
        status: {
          online: "#237d40",
          offline: "#9aa0a0",
          demo: "#b07d1c",
          warning: "#c9772e",
          danger: "#b4232e",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 16, 0.04), 0 4px 16px rgba(16, 24, 16, 0.06)",
        cardHover:
          "0 2px 4px rgba(16, 24, 16, 0.06), 0 12px 28px rgba(16, 24, 16, 0.1)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
