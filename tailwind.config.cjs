/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: "#2d86ff",
                black: "#000",
                white: "#fff",
            },
        },
    },
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    prefix: "tw-",
    plugins: [],
};
