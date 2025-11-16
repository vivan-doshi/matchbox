export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cardinal: {
          DEFAULT: '#990000',  // USC Cardinal Red
          light: '#9D2235',     // Lighter shade for gradients
        },
        gold: {
          DEFAULT: '#FFCC00',   // USC Gold
          accent: '#FFC72C',    // Lighter gold for hovers
        },
      },
    },
  },
  plugins: [],
}