/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'celebra-blue': '#0111a2',
        'celebra-orange': '#d23a07',
        // Garantindo cores com contraste adequado
        primary: {
          50: '#ecf0ff',
          100: '#dce2ff',
          200: '#bbc8ff',
          300: '#96a3ff',
          400: '#7a80ff',
          500: '#6860fa',
          600: '#5548e8',
          700: '#473ad1',
          800: '#3a30a9',
          900: '#2f2d80',
          950: '#1a1a4b',
        },
        secondary: {
          50: '#fff5ec',
          100: '#ffe9d5',
          200: '#ffd0aa',
          300: '#ffb275',
          400: '#ff8c3d',
          500: '#ff6f1b',
          600: '#ed5000',
          700: '#c54104',
          800: '#9c360c',
          900: '#7e300f',
          950: '#441505',
        },
        gray: {
          ...colors.gray,
          750: '#374151',
          850: '#1f2937',
          950: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Adicionar mais estilos de texto com contraste adequado
      textColor: {
        primary: {
          light: '#0111a2', // Para fundo claro
          dark: '#dce2ff', // Para fundo escuro
        },
        secondary: {
          light: '#c54104', // Para fundo claro
          dark: '#ffb275', // Para fundo escuro
        },
      },
    },
  },
  plugins: [forms],
  darkMode: 'class',
}
