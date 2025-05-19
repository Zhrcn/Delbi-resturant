/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ef4444',
          dark: '#dc2626',
        },
        secondary: {
          light: '#ef4444',
          dark: '#dc2626', // red-600
        },
        accent: {
          light:  '#ef4444',
          dark: '#dc2626', // violet-600
        },
        background: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        card: {
          light: '#ffffff',
          dark: '#2d2d2d',
        },
        text: {
          light: '#1f2937',
          dark: '#f3f4f6',
          muted: {
            light: '#6b7280',
            dark: '#9ca3af'
          }
        },
        success: {
          light: '#10b981', // emerald-500
          dark: '#059669',  // emerald-600
          bg: {
            light: '#d1fae5', // emerald-100
            dark: '#064e3b'   // emerald-900
          }
        },
        danger: {
          light: '#ef4444', // red-500
          dark: '#dc2626',  // red-600
          bg: {
            light: '#fee2e2', // red-100
            dark: '#7f1d1d'   // red-900
          }
        },
        warning: {
          light: '#f59e0b', // amber-500
          dark: '#d97706',  // amber-600
          bg: {
            light: '#fef3c7', // amber-100 
            dark: '#78350f'   // amber-900
          }
        },
        info: {
          light: '#3b82f6', // blue-500
          dark: '#2563eb',  // blue-600
          bg: {
            light: '#dbeafe', // blue-100
            dark: '#1e3a8a'   // blue-900
          }
        },
        admin: {
          primary: '#6366f1', // red-500
          sidebar: {
            bg: '#312e81',    // red-900
            hover: '#4338ca', // red-700
            active: '#4f46e5', // red-600
            text: '#e0e7ff'   // red-100
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'admin': '0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -1px rgba(99, 102, 241, 0.06)'
      }
    },
  },
  plugins: [],
} 