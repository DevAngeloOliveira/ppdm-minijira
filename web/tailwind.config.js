/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0ea5e9',
          700: '#0284c7',
          800: '#0369a1',
          900: '#0c4a6e',
        },
        sidebar: {
          dark: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
        },
      },
    },
  },
  plugins: [],
}
