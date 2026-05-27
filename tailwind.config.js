/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brandNavy: "#001f3f",
        brandRed: "#ca3433",
        brandRedDark: "#a72828",
        brandRose: "#faebeb",
        brandSand: "#f7f4f1",
        brandBorder: "#e2e2e2",
        brandText: "#203040",
        brandMuted: "#5f6773",
      },
    },
  },
  plugins: [],
};
