import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50:  "#FAFAF8",
          100: "#F4F3EE",
          200: "#E8E6DE",
          300: "#D2CFC2",
          400: "#9C9A8E",
          500: "#6B6A60",
          600: "#4A4A42",
          700: "#33332D",
          800: "#1F1F1B",
          900: "#0E0E0C",
        },

        mon: { 50: "#FFEAEA", 200: "#FFB8B8", 500: "#FF6B6B", 700: "#B33B3B", 900: "#5C1212" },
        tue: { 50: "#FFEEDC", 200: "#FFCB8E", 500: "#FFA94D", 700: "#B36621", 900: "#5C2F08" },
        wed: { 50: "#FFF8DA", 200: "#FFEC8A", 500: "#FFD53E", 700: "#A07E0F", 900: "#5C4502" },
        thu: { 50: "#E8FAE3", 200: "#B3EFA8", 500: "#73DD66", 700: "#338A2A", 900: "#16470F" },
        fri: { 50: "#DEF6F8", 200: "#9DE2E9", 500: "#5DC9D4", 700: "#236A73", 900: "#0B383E" },
        sat: { 50: "#E5EBFF", 200: "#A9BAFF", 500: "#748FFC", 700: "#2F4ABA", 900: "#0E1F66" },
        sun: { 50: "#F0EAFF", 200: "#CDB9FF", 500: "#B197FC", 700: "#5E40B5", 900: "#2A1965" },

        teal:   { 50: "#E5F4EE", 100: "#BFE5D5", 200: "#8DD0B5", 400: "#3DA67D", 500: "#1D9E75", 600: "#0F6E56", 700: "#0B5240", 900: "#04342C" },
        coral:  { 50: "#FAECE7", 100: "#F7D3C6", 200: "#F0B3A0", 500: "#D85A30", 600: "#B33F1A", 700: "#712B13" },
        amber:  { 50: "#FAEEDA", 100: "#FBDCA8", 200: "#FAC775", 500: "#EF9F27", 600: "#BA7517", 700: "#854F0B" },
        purple: { 50: "#EEEDFE", 100: "#D6D3FA", 200: "#AFA9EC", 500: "#7F77DD", 600: "#534AB7", 700: "#3C3489" },
        night:  { 50: "#E6F1FB", 100: "#B5D4F4", 200: "#85B7EB", 500: "#378ADD", 600: "#185FA5", 700: "#0C447C" },
        gold:   { 50: "#FBF1DC", 100: "#F5DDA1", 400: "#D9A645", 600: "#A47720", 800: "#5E4310" },
        pink:   { 50: "#FCEAF1", 100: "#F8C9DC", 200: "#F2A6C5", 500: "#E16BA0", 700: "#A02E66" },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.011em",
        tight2: "-0.022em",
        tight3: "-0.034em",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.375rem",
        "3xl": "1.75rem",
      },
      maxWidth: {
        "screen-app": "1180px",
      },
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        breath: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(120px) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        floatUp: "floatUp 0.4s ease-out both",
        breath: "breath 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
