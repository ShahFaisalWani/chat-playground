import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "bg-gradient": "var(--bg-gradient)",
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          10: "var(--color-primary-10)",
        },
        bg: "var(--color-bg)",
        text: {
          DEFAULT: "var(--color-text-default)",
          10: "var(--color-text-10)",
          gray: "var(--color-text-gray)",
        },
        gray: {
          DEFAULT: "var(--color-gray-default)",
          10: "var(--color-gray-10)",
          20: "var(--color-gray-20)",
          ...require("tailwindcss/colors").gray,
        },
        red: {
          DEFAULT: "var(--color-red)",
          ...require("tailwindcss/colors").red,
        },
      },
      fontSize: {
        xxs: "0.75rem",
        xs: "0.9rem",
        sm: "1rem",
        md: "1.175rem",
        base: "1.2rem",
        lg: "1.25rem",
        xl: "1.75rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "4xl": "2.7rem",
        "5xl": "3rem",
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
