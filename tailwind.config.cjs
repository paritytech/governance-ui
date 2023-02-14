/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e6007a",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
