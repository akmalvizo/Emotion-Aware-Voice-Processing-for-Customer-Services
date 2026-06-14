/** @type {import('tailwindcss').Config} */
export default {
  // 1. Where Tailwind scans for class names (crucial for purging unused CSS)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // 2. Customizations (e.g., custom colors, fonts, spacing)
  theme: {
    extend: {
      colors: {
        // Defining your primary brand color based on the indigo/slate used in the plan
        'primary': '#4f46e5', // Indigo-600
        'primary-dark': '#4338ca', // Indigo-700
        'surface-light': '#f8fafc', // Slate-50 (Used as background)
      },
      // You can define custom breakpoints, font families, etc., here.
    },
  },
  
  // 3. Optional plugins for enhanced functionality
  plugins: [
    // Recommended for styling forms (inputs, checkboxes) correctly
    require('@tailwindcss/forms'),
    
    // Recommended for styling markdown/rich text content (e.g., in /about)
    require('@tailwindcss/typography'),
  ],
}