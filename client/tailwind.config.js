/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        
        visionroot: {
          blue: '#0e2446', 
          green: '#00a651',
        }
      }
    },
  },
  plugins: [],
}