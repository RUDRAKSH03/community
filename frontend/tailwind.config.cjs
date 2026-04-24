/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        md: {
          bg: '#FFFBFE',
          surface: '#F3EDF7',
          'surface-low': '#E7E0EC',
          primary: '#6750A4',
          'sec-container': '#E8DEF8',
          tertiary: '#7D5260',
          text: '#1C1B1F',
          'text-sec': '#49454F',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        material: 'cubic-bezier(0.2, 0, 0, 1)',
        'material-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      boxShadow: {
        'md-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'md-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
