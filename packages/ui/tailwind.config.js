/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./globals.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
