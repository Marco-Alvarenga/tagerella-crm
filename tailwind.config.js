/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
	],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#007bff", // cor principal
          dark: "#0056b3",    // versão mais escura
        },
        // você pode adicionar outras variações se necessário
        // primary: {
        //   light: "#4da3ff",
        //   DEFAULT: "#007bff",
        //   dark: "#0056b3",
        // }
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}