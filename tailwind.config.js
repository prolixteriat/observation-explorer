/** @type {import('tailwindcss').Config} */
const withMT = require('@material-tailwind/react/utils/withMT');
const defaultTheme = require('tailwindcss/defaultTheme');

export default withMT({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // sans: ['Roboto', ...defaultTheme.fontFamily.sans],
      },      
    },
  },
  plugins: [],
  important: true,    // required to force use of Tailwind styles when used in iFrame
});
