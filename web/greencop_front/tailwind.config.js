/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1E90FF', // Bleu
        success: '#00C853', // Vert
        neutral: '#FFFFFF', // Blanc
      },
    },
  },
  plugins: [],
}
