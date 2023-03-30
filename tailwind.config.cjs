/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter"],
        unbounded: "Unbounded",
      },
      fontSize: {
        body: "1rem",
        "body-2": "0.875rem",
        h1: ["4rem", { fontWeight: 700 }],
        h2: "3rem",
        h3: "2rem",
        h4: "1.625rem",
        h5: "1.25rem",
      },
      colors: {
        bg: { default: "#F5F4F4" },
        "p-pink": { 100: "#FFE4F3", 600: "#CB006C" },
        "p-purple": { 100: "#F3F5FB", 900: "#1C0533" },
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
        fadeIn: {
          "0%": { background: "rgba(0,0,0,0)" },
          "100%": { background: "rgba(0,0,0,0.7)" },
        },
        slideInRight: {
          "0%": { right: -500 },
          "100%": { right: 0 },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
