const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F6F2',
          100: '#E8EDE3',
          200: '#D3DEC9',
          300: '#BAC7A8',
          400: '#A3B18A',
          500: '#748D6B',
          600: '#526B52',
          700: '#405640',
          800: '#303A30',
          900: '#202720',
          950: '#171C18',
        },
        oatmeal: {
          50: '#FBFBF9',
          100: '#F5F4EE',
          200: '#ECECE4',
          300: '#DDE1D8',
          400: '#B1B8AC',
          500: '#687168',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#F5F4EE",
            foreground: "#202720",
            primary: {
              DEFAULT: "#526B52",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#A3B18A",
              foreground: "#202720",
            },
            content1: "#ffffff",
            content2: "#ECECE4",
          },
        },
        dark: {
          colors: {
            background: "#171C18",
            foreground: "#F0F1E9",
            primary: {
              DEFAULT: "#A3B18A",
              foreground: "#202720",
            },
            secondary: {
              DEFAULT: "#899B7A",
              foreground: "#F0F1E9",
            },
            content1: "#202720",
            content2: "#292F29",
          },
        },
      },
    }),
  ]
};
