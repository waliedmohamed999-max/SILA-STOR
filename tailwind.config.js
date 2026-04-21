export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0f172a",
        accent: "#6366f1",
        violetAccent: "#8b5cf6",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        body: ["Cairo", "system-ui", "sans-serif"],
        heading: ["IBM Plex Sans Arabic", "Cairo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 18px 60px -36px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};
