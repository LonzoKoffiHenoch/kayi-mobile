/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFCCAA',
          300: '#FFA574',
          400: '#FF7A3C',
          500: '#FF6B35', // Main primary - Orange professionnel
          600: '#E5522A',
          700: '#C04020',
          800: '#9F3419',
          900: '#7A2B16',
        },
        secondary: {
          50: '#F0F5F2',
          100: '#DCE8E0',
          200: '#B9D1C2',
          300: '#8CB69E',
          400: '#5E947A',
          500: '#2C5F41', // Main secondary - Vert professionnel
          600: '#255037',
          700: '#1F412E',
          800: '#1A3425',
          900: '#15281D',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        'sans': ['System'],
      }
    },
  },
  plugins: [],
}