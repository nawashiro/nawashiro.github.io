/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"Noto Sans JP\"", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px -28px rgba(47, 38, 30, 0.45)",
      },
      keyframes: {
        "hero-jump": {
          "0%, 8%, 100%": { transform: "translateY(0)" },
          "4%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "hero-jump": "hero-jump 5s ease-in infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
