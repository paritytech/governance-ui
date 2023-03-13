/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e6007a",
        secondary: "#321D47",
      },
      keyframes: {
        blur: {
          "0%": { backdropFilter: "blur(2px)" },
          "100%": { backdropFilter: "blur(8px)" },
        },
        lift: {
          "0%": { marginTop: 24, opacity: 0 },
          "100%": { marginTop: 0, opacity: 1 },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
