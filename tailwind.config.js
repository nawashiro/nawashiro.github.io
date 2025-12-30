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
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        nawashiro: {
          primary: "#48731d",
          "primary-content": "#f7f4ef",
          secondary: "#cbbba0",
          accent: "#4a6f8a",
          neutral: "#2a2722",
          "neutral-content": "#f7f4ef",
          "base-100": "#fdfaf5",
          "base-200": "#f5efe7",
          "base-300": "#e8dfd4",
          "base-content": "#2c2a25",
          info: "#4f7cc9",
          success: "#3e9a73",
          warning: "#d59a2f",
          error: "#cf5b54",
          "--rounded-box": "1.5rem",
          "--rounded-btn": "9999px",
          "--rounded-badge": "9999px",
        },
      },
    ],
  },
};
