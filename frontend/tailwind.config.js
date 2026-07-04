/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3525cd',
        'primary-container': '#4f46e5',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        tertiary: '#7e3000',
        surface: {
          lowest: '#ffffff',
          low: '#f0f3ff',
          default: '#e7eefe',
          high: '#e2e8f8',
          highest: '#dce2f3',
          inverse: '#2a313d'
        },
        outline: {
          default: '#777587',
          variant: '#c7c4d8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
