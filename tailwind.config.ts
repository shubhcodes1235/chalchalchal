import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                raspberry: {
                    DEFAULT: '#E91E63',
                    hover: '#D81B60',
                },
                blush: {
                    50: '#FFF5F7',
                    100: '#F8BBD0',
                },
                'deep-plum': '#2A1B2E',
                charcoal: '#4A142F',
                night: {
                    50: '#F5F5F3',
                    100: '#E8E8E1',
                    200: '#D1D1C7',
                    300: '#B9B9AD',
                    400: '#A1A193',
                    500: '#898979',
                    600: '#717163',
                    700: '#59594D',
                    800: '#414137',
                    900: '#292921',
                    950: '#11110B',
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
                handwritten: ['Caveat', 'cursive'],
                poppins: ['Poppins', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                '4xl': '3rem',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(233, 30, 99, 0.1)',
                'glow': '0 0 20px rgba(233, 30, 99, 0.3)',
                'rose-glow': '0 10px 40px -10px rgba(233, 30, 99, 0.25)',
                'pink-soft': '0 10px 40px -10px rgba(233, 30, 99, 0.2)',
            },
            letterSpacing: {
                'handwritten': '-0.03em',
                'tightest': '-0.05em',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'bounce-gentle': 'bounce-gentle 2s infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'grow': 'grow 0.5s ease-out',
                'scale-pulse': 'scale-pulse 3s ease-in-out infinite',
                'marquee': 'marquee 60s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                'slide-up': {
                    from: { transform: 'translateY(20px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                grow: {
                    from: { transform: 'scale(0.8)', opacity: '0' },
                    to: { transform: 'scale(1)', opacity: '1' },
                },
                'scale-pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.08)' },
                },
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-100%)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
    ],
}

export default config
