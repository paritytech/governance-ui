/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e6007a",
        secondary: "#321D47",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
