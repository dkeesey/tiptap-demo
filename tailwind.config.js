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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.editor.text'),
            maxWidth: '100%',
            lineHeight: '1.6',
            
            'h1, h2, h3, h4, h5, h6': {
              fontWeight: '600',
              color: theme('colors.gray.900'),
              marginBottom: '0.5rem',
              marginTop: '1.5rem',
            },
            
            a: {
              color: theme('colors.blue.600'),
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s',
              '&:hover': {
                color: theme('colors.blue.700'),
                textDecoration: 'underline',
              },
            },
            
            'code': {
              backgroundColor: theme('colors.gray.100'),
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            'pre': {
              backgroundColor: theme('colors.gray.50'),
              borderRadius: '0.5rem',
              padding: '1rem',
            },
            
            'ul, ol': {
              paddingLeft: '1.5rem',
            },
            
            blockquote: {
              borderLeftColor: theme('colors.gray.300'),
              fontStyle: 'italic',
              borderLeftWidth: '0.25rem',
              paddingLeft: '1rem',
              color: theme('colors.gray.600'),
            },
          },
        },
        sm: {
          css: {
            fontSize: '0.875rem',
          },
        },
        lg: {
          css: {
            fontSize: '1.125rem',
          },
        },
      }),
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
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}