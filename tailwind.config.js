/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      calistoga: ['Calistoga', 'sans-serif'],
      merriweatherRegular: ['Merriweather-Regular', 'serif'],
      merriweatherBold: ['Merriweather-Bold', 'serif'],
    },
    extend: {
      colors: {
        turquoise: {
          100: '#f0fbf8',
          200: '#e2f7f2',
          300: '#d3f3eb',
          400: '#c3efe5',
          500: '#b4ebde',
          600: '#a3e7d8',
          700: '#92e3d1',
          800: '#80dfcb',
          900: '#6cdac4',
          1000: '#55d6be',
        },
        gunmetal: {
          100: '#e6e7e7',
          200: '#cdd0ce',
          300: '#b5b9b7',
          400: '#9ea3a0',
          500: '#878d8a',
          600: '#717874',
          700: '#5b635f',
          800: '#464f4b',
          900: '#333c37',
          1000: '#202a25',
        },
      },
    },
  },
  plugins: [],
};
