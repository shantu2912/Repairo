
// --- DATABASE INITIALIZATION ---
const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';

if (window.supabase) {
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// --- TAILWIND CONFIG ---
tailwind.config = {
theme: {
extend: {
colors: { 
'brand-olive': '#5D5646', 
'brand-gold': '#A07D54',  
'brand-cream': '#EEEAE2', 
'brand-dark': '#4D4C4B', 
'brand-beige': '#DFD4C3', 
'brand-red': '#EF4444', 
'brand-green': '#10B981' 
},
fontFamily: { 
sans: ['Inter', 'system-ui', 'sans-serif'], 
serif: ['"Playfair Display"', 'serif'] 
},
boxShadow: { 
'super-float': '0 20px 40px -12px rgba(93, 86, 70, 0.15)', 
'neon': '0 0 20px rgba(160, 125, 84, 0.3)',
'premium': '0 8px 24px rgba(0, 0, 0, 0.04)',
'card-hover': '0 20px 30px -12px rgba(93, 86, 70, 0.2)',
'premium-glow': '0 0 30px rgba(160,125,84,0.3)'
},
animation: {
'chaos-spin': 'chaosSpin 2s linear infinite',
'forge-flash': 'forgeFlash 1.5s ease-out forwards 1s',
'draw-text': 'drawText 2s ease-out forwards 1.2s',
'fill-text': 'fillText 1s ease-out forwards 2.5s',
'logo-shine': 'logoShine 2s ease-in-out forwards 2.8s',
'sub-text-slide': 'subTextSlide 1s ease-out forwards 3s',
'text-scroll': 'textScroll 6s infinite',
'float-icon': 'floatIcon 3s ease-in-out infinite',
'float-fast': 'floatIcon 2s ease-in-out infinite',
'shine-pass': 'shinePass 0.8s ease-in-out',
'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
'fade-in-scale': 'fadeInScale 0.5s ease-out',
'glow-pulse': 'glowPulse 2s ease-in-out infinite'
},
keyframes: {
textScroll: { 
'0%, 20%': { transform: 'translateY(0%)' }, 
'25%, 45%': { transform: 'translateY(-25%)' }, 
'50%, 70%': { transform: 'translateY(-50%)' }, 
'75%, 95%': { transform: 'translateY(-75%)' }, 
'100%': { transform: 'translateY(-0%)' } 
},
chaosSpin: { 
'0%': { transform: 'rotate(0deg) scale(1)', opacity: '0.5' }, 
'50%': { transform: 'rotate(180deg) scale(1.1)', opacity: '0.8' }, 
'100%': { transform: 'rotate(360deg) scale(1)', opacity: '0.5' } 
},
forgeFlash: { 
'0%': { opacity: '0', transform: 'scale(0)' }, 
'50%': { opacity: '1', transform: 'scale(1.3)' }, 
'100%': { opacity: '0', transform: 'scale(2)' } 
},
drawText: { 'to': { strokeDashoffset: '0' } },
fillText: { 'from': { fillOpacity: '0' }, 'to': { fillOpacity: '1' } },
logoShine: { '0%': { backgroundPosition: '-200%' }, '100%': { backgroundPosition: '200%' } },
subTextSlide: { 'from': { opacity: '0', transform: 'translateY(20px)' }, 'to': { opacity: '1', transform: 'translateY(0)' } },
floatIcon: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
shinePass: { '0%': { transform: 'translateX(-100%) skewX(-15deg)' }, '100%': { transform: 'translateX(200%) skewX(-15deg)' } },
fadeInScale: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
glowPulse: { '0%, 100%': { boxShadow: '0 0 5px rgba(160,125,84,0.3)' }, '50%': { boxShadow: '0 0 25px rgba(160,125,84,0.6)' } }
}
}
}
}
