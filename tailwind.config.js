/** @type {import('tailwindcss').Config} */
module.exports = {
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
            primary: '#7c3aed',      // 紫色主色（和你之前用的效果一致）
            secondary: '#a78bfa',
            accent: '#c4b5fd',
            background: '#0f0f23',
          },
        },
      },
  plugins: [],
};
