/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- Add this line
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your VisionRoot Brand Colors
        visionroot: {
          blue: '#0e2446', 
          green: '#00a651',
        }
      }
    },
  },
  plugins: [],
}