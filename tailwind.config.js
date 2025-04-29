/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          background: '#ffffff',
          text: '#374151',
          placeholder: '#9CA3AF',
          border: '#E5E7EB',
          toolbar: {
            background: '#F9FAFB',
            border: '#E5E7EB',
            button: {
              background: '#FFFFFF',
              backgroundHover: '#F3F4F6',
              border: '#D1D5DB',
              icon: '#6B7280',
              iconActive: '#111827',
            },
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
