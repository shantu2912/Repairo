// contact.js - Tailwind configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand-olive': '#5D5646',
                'brand-gold': '#A07D54',
                'brand-cream': '#EEEAE2',
                'brand-dark': '#4D4C4B',
                'brand-blue': '#3E5974',
                'brand-beige': '#DFD4C3'
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            boxShadow: {
                'glass-card': '0 8px 32px 0 rgba(93, 86, 70, 0.15)',
            },
            animation: {
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'fade-in-delayed': 'fadeIn 0.8s ease-out 0.3s forwards',
            },
            keyframes: {
                slideUp: { '0%': { transform: 'translateY(30px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
            },
            backgroundImage: {
               'contact-hero': "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop')",
            }
        }
    }
}
