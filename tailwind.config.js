/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '18': '4.5rem', 
      },
      transitionProperty: {
        'width': 'width',
      },
       screens: {
        xs: '480px', // or any custom value
      },

    },
  },
  plugins: [],
}