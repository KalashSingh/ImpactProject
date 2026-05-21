/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: "#050a14",
          panel: "#080f1f",
          card: "#0a1628",
          border: "#0d2040",
          blue: "#00d4ff",
          "blue-dim": "#0066aa",
          red: "#ff2d55",
          "red-dim": "#8b0020",
          green: "#00ff88",
          "green-dim": "#004d2a",
          yellow: "#ffcc00",
          gray: "#4a5568",
          text: "#c8d8f0",
          "text-dim": "#5a7a9a",
        },
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        display: ["'Orbitron'", "sans-serif"],
        body: ["'Rajdhani'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "scan": "scan 2s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 22%, 24%, 55%": { opacity: "0.4" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #00d4ff, 0 0 10px #00d4ff" },
          "100%": { boxShadow: "0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #00d4ff33" },
        },
      },
      boxShadow: {
        "neon-blue": "0 0 10px #00d4ff, 0 0 20px #00d4ff44",
        "neon-red": "0 0 10px #ff2d55, 0 0 20px #ff2d5544",
        "neon-green": "0 0 10px #00ff88, 0 0 20px #00ff8844",
        "panel": "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,212,255,0.1)",
      },
    },
  },
  plugins: [],
};
