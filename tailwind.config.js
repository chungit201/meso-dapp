/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  important: true,
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './common/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: 'var(--color-primary-light)',
          main: 'var(--color-primary-main)',
          dark: 'var(--color-primary-dark)',
        },
        neutral: {
          main: 'var(--color-title-home)',
        },
        paper: {
          gray: 'var(--color-bg-box-currency)',
          main: 'var(--color-bg-card)',
        },
        grey: {
          100: 'rgb(var(--hip-text-grey-100) / <alpha-value>)',
          300: 'rgb(var(--hip-text-grey-300) / <alpha-value>)',
          500: 'rgb(var(--hip-text-grey-500) / <alpha-value>)',
          700: 'rgb(var(--hip-text-grey-700) / <alpha-value>)',
          900: 'rgb(var(--hip-text-grey-900) / <alpha-value>)',
        },
        blue: {
          500: '#0090F9',
        },
        prime: {
          100: '#0090F9',
          300: '#0090F9',
          400: '#0090F9',
          500: '#0090F9',
          700: '#0090F9',
          800: '#0090F9',
          900: '#0090F9',
        },
        success: {
          500: '#82CB7C',
        },
        error: {
          500: '#EB6A5D',
        },
        info: {
          100: 'rgba(255, 255, 255, 0.5)',
          200: '#ABAFB5',
          500: '#5B6CFE',
        },
        warn: {
          500: '#FFA24E',
        },
        up: '#29C995',
        down: '#E96A5C',
        dark: {
          100: '#0B0E11',
        },
        green: {
          100: '#34EF4F',
        },
      },
      boxShadow: {
        base: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        primeLight: 'linear-gradient(0deg, #F7F5FD 0%, #FDFDFF 100%)',
        homeCard: 'var(--hip-bg-home-card)',
        'btn-gradient': 'var(--hip-bg-btn-gradient)',
        'select-border': 'var(--hip-bg-select-border)',
      },
      backgroundColor: (theme) => ({
        ...theme('colors'),
        primeDark: '#111111',
        surface: 'rgb(var(--hip-bg-color-surface) / <alpha-value>)',
        field: 'rgb(var(--hip-bg-color-field) / <alpha-value>)',
        label: 'var(--hip-bg-label)',
        transparent: 'transparent',
      }),
      boxShadow: {
        none: 'none',
        main: '0px 4px 35px rgba(0, 0, 0, 0.05)',
        subTitle: '0px 4px 35px rgba(0, 0, 0, 0.1)',
        home: 'var(--hip-shadow-home)',
      },
      borderRadius: {
        none: '0',
        DEFAULT: '4px',
        lg: '8px',
        xl: '10px',
        xxl: '20px',
        full: '9999px',
      },
      fontFamily: {
        Urbanist: ['Urbanist', 'sans-serif'],
      },
    },
    screens: {
      sm: '800px',
      md: '1200px',
      lg: '1400px',
      xl: '1535px',
      desktop: '99999px', // desktop first
      laptop: '1535px',
      tablet: '1279px',
      mobile: '767px',
    },
  },
  plugins: [
    plugin(function ({ addUtilities, addComponents, theme }) {
      const screens = theme('screens', {});
      addUtilities({
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.text-gradient-primary': {
          background: 'linear-gradient(90.74deg, #5687F8 -17.79%, #7743E6 120.43%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-secondary': {
          background: 'linear-gradient(273.38deg, #8032FF 19.81%, #472394 87.9%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      });
      addComponents([
        {
          '.text-16px': {
            'font-size': '14px',
          },
          '.text-xl': {
            'font-size': '17px',
          },
          '.text-18px': {
            'font-size': '16px',
          },
          '.text-24px': {
            'font-size': '16px',
          },
          '.text-32px': {
            'font-size': '18px',
          },
          '.text-40px': {
            'font-size': '20px',
          },
          '.text-55px': {
            'font-size': '22px',
          },
          '.text-60px': {
            'font-size': '25px',
          },
          '.text-64px': {
            'font-size': '36px',
          },
          '.text-80px': {
            'font-size': '45px',
          },
        },
        {
          [`@media (min-width: ${screens.sm})`]: {
            '.text-16px': {
              'font-size': '16px',
            },
            '.text-xl': {
              'font-size': '17.5px',
            },
            '.text-24px': {
              'font-size': '19px',
            },
            '.text-32px': {
              'font-size': '24px',
            },
            '.text-40px': {
              'font-size': '27px',
            },
            '.text-55px': {
              'font-size': '30px',
            },
            '.text-18px': {
              'font-size': '16px',
            },
            '.text-60px': {
              'font-size': '37px',
            },
            '.text-64px': {
              'font-size': '39px',
            },
            '.text-80px': {
              'font-size': '50px',
            },
          },
        },
        {
          [`@media (min-width: ${screens.md})`]: {
            '.text-18px': {
              'font-size': '18px',
            },
            '.text-xl': {
              'font-size': '18px',
            },
            '.text-24px': {
              'font-size': '20px',
            },
            '.text-32px': {
              'font-size': '26px',
            },
            '.text-40px': {
              'font-size': '30px',
            },
            '.text-55px': {
              'font-size': '32px',
            },
            '.text-60px': {
              'font-size': '40px',
            },
            '.text-64px': {
              'font-size': '42px',
            },
            '.text-80px': {
              'font-size': '55px',
            },
          },
        },
        {
          [`@media (min-width: ${screens.lg})`]: {
            '.text-18px': {
              'font-size': '18px',
            },
            '.text-xl': {
              'font-size': '18.5px',
            },
            '.text-24px': {
              'font-size': '22px',
            },
            '.text-32px': {
              'font-size': '28px',
            },
            '.text-40px': {
              'font-size': '33px',
            },
            '.text-55px': {
              'font-size': '36px',
            },
            '.text-60px': {
              'font-size': '45px',
            },
            '.text-64px': {
              'font-size': '47px',
            },
            '.text-80px': {
              'font-size': '60px',
            },
          },
        },
        {
          [`@media (min-width: ${screens.xl})`]: {
            '.text-18px': {
              'font-size': '18px',
            },
            '.text-xl': {
              'font-size': '19px',
            },
            '.text-24px': {
              'font-size': '23px',
            },
            '.text-32px': {
              'font-size': '30px',
            },
            '.text-40px': {
              'font-size': '36px',
            },
            '.text-55px': {
              'font-size': '45px',
            },
            '.text-60px': {
              'font-size': '50px',
            },
            '.text-64px': {
              'font-size': '53px',
            },
            '.text-80px': {
              'font-size': '70px',
            },
          },
        },
        {
          [`@media (min-width: ${screens['2xl']})`]: {
            '.text-xl': {
              'font-size': '20px',
            },
            '.text-18px': {
              'font-size': '18px',
            },
            '.text-24px': {
              'font-size': '24px',
            },
            '.text-32px': {
              'font-size': '32px',
            },
            '.text-40px': {
              'font-size': '40px',
            },
            '.text-55px': {
              'font-size': '55px',
            },
            '.text-60px': {
              'font-size': '60px',
            },
            '.text-64px': {
              'font-size': '64px',
            },
            '.text-80px': {
              'font-size': '80px',
            },
          },
        },
      ]);
    }),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
