module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "hover-right-bottom": "4px 4px 7px #007BA7",
      },
      colors: {
        bh: {
          DEFAULT: "#007BA7",
          dark: "#005F82",
          light: "#66C5E3", // Light version of your color
          hover: "#008CBF", // Slightly brighter for hover effects
          contrast: "#FFD700", // Optional: A contrasting color
        },
      },
      
    },
  },
  plugins: [],
};
