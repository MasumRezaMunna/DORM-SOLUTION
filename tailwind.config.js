const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#059669",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#0D9488",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#059669",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#0D9488",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ]
};
