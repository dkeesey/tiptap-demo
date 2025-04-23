/** @type {import('tailwindcss').Config} */
export default {
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
    },
  },
  plugins: [],
}
