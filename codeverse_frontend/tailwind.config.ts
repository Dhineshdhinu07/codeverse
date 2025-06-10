import { codeverseTheme } from "./utils/theme";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: codeverseTheme.fonts.heading,
        body: codeverseTheme.fonts.body,
      },
      colors: {
        primary: codeverseTheme.colors.primary,
        accent: codeverseTheme.colors.accent,
        background: codeverseTheme.colors.background,
        text: codeverseTheme.colors.text,
      },
      boxShadow: {
        neon: codeverseTheme.shadows.neon,
        glow: codeverseTheme.shadows.glow,
      },
    },
  },
  plugins: [],
};
