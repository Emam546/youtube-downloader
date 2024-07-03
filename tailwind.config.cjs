/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors:{
      primary:"#2d86ff",
      black:"#000",
      white:"#fff"
    },
    extend: {

    },
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "tw-",
  plugins: [],
}
