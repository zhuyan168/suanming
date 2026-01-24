/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./config/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7f13ec',
        secondary: '#a78bfa',
        accent: '#c4b5fd',
        background: '#0f0f23',
        'background-light': '#f7f6f8',
        'background-dark': '#191022',
      },
      fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px 0 rgba(234, 179, 8, 0.2), 0 0 5px 0 rgba(234, 179, 8, 0.1)',
      },
    },
  },
  plugins: [],
};
