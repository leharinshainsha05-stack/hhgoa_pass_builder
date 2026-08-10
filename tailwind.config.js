/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff0080',
        accent: '#f5dc18',
        bgGreen: '#0b6839',
        cardText: '#fffbea',
        cardDark: '#000000',
      },
    },
  },
  plugins: [],
}
