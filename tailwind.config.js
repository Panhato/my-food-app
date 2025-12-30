/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ដាក់ Kantumruy Pro សម្រាប់គ្រប់កន្លែង
        sans: ['"Kantumruy Pro"', 'sans-serif'],
        header: ['"Kantumruy Pro"', 'sans-serif'], // លែងប្រើ Moul ហើយ
      },
    },
  },
  plugins: [],
}