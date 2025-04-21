/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"], //including all files in the app folder
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#202124',
        surface: '#292A2D',
        border: '#3C3D3F',
        text: '#E8EAED',
        subtle: '#9AA0A6',
        accent: '#8AB4F8',
        hover: '#303134',
        highlight: '#5F6368',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },

      spacing: {'72': '18rem', '84': '21rem'},
      borderRadius: {'xl': '1.5rem', '2xl': '2rem'},
    }
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ]
}
