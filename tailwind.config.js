/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"], //including all files in the app folder
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FF0FDA',
        secondary: '#D2340A',
        light: {
          100: '#D234FA',
          200: '#A8B5DB',
          300: '#7F94C7',
        },
        dark: {
          100: '#000000',
          200: '#111111',
          300: '#222222',
        },
        accent: '#000000',
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
