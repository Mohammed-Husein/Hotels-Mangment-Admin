/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  corePlugins: {
    preflight: false,
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        dark: "#2f3349", // main dark theme backgroundColor
        light: "#fff", // main light theme backgroundColor
      },
      colors: {
        main: {
          DEFAULT: "#1867C0",
          dark: "#0e0e0e",
          light: "#fff",
          // 100: '#feefd3',
          // 200: '#fcdea7',
          // 300: '#fbce7c',
          // 400: '#f9bd50',
          // 500: '#3FB984',
          // 600: '#c68a1d',
          // 700: '#956816',
          // 800: '#63450e',
          // 900: '#322307',
        },
      },
    },
  },
};
