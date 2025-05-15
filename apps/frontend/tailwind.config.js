/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/lib/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/globals.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
