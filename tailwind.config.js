/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          bg: "#060913",
          card: "#0d1322",
          cardBorder: "#1e293b",
          cyan: "#00f0ff",
          pink: "#ff007f",
          purple: "#9333ea",
          neonGreen: "#10b981",
          gold: "#f59e0b",
          dark: "#0a0f1d",
          muted: "#64748b"
        }
      },
      fontFamily: {
        arcade: ["'Press Start 2P'", "monospace"],
        tech: ["'Orbitron'", "'Rajdhani'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"]
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.45)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.45)',
        'neon-gold': '0 0 15px rgba(245, 158, 11, 0.45)',
        'neon-purple': '0 0 20px rgba(147, 51, 234, 0.45)',
      }
    },
  },
  plugins: [],
};
