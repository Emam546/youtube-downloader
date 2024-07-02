/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            colors: {
                background: "#F0F0F0",
                "secondary-color": "#E6E6E6",
                black: "#000",
                white: "#fff",
            },
        },
    },
    content: ["./app/renderer/progress/**/*.{js,ts,jsx,tsx}"],
    plugins: [],
};
