
        tailwind.config = {
            theme: {
                extend: {
                    colors: { 
                        'brand-olive': '#5D5646', 
                        'brand-gold': '#A07D54', 
                        'brand-cream': '#F8F5F0', 
                        'brand-dark': '#2D2B28', 
                        'brand-beige': '#DFD4C3', 
                        'brand-green': '#10B981', 
                        'brand-red': '#EF4444',
                        'brand-warning': '#F59E0B'
                    },
                    fontFamily: { 
                        sans: ['Inter', 'system-ui', 'sans-serif'], 
                        serif: ['"Playfair Display"', 'serif'] 
                    },
                    boxShadow: { 
                        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)', 
                        'up': '0 -5px 20px rgba(0,0,0,0.05)',
                        'premium': '0 20px 40px -12px rgba(93, 86, 70, 0.15)',
                        'card-hover': '0 20px 30px -12px rgba(93, 86, 70, 0.2)',
                        'premium-glow': '0 0 30px rgba(160,125,84,0.3)'
                    },
                    animation: { 
                        'slide-up': 'slideUp 0.4s ease-out forwards', 
                        'pulse-slow': 'pulse 3s infinite',
                        'fade-scale': 'fadeInScale 0.3s ease-out',
                        'shimmer': 'shimmer 2.5s linear infinite'
                    },
                    keyframes: { 
                        slideUp: { 
                            '0%': { transform: 'translateY(100%)' }, 
                            '100%': { transform: 'translateY(0)' } 
                        },
                        fadeInScale: {
                            '0%': { opacity: '0', transform: 'scale(0.95)' },
                            '100%': { opacity: '1', transform: 'scale(1)' }
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '-200% center' },
                            '100%': { backgroundPosition: '200% center' }
                        }
                    }
                }
            }
        }

        // --- MASTER SERVICE DATABASE ---
        const servicesDB = {
            "electrician": { 
                name: "Expert Electrician", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800",
                desc: "Certified electricians for wiring, appliance installation, and repairs. 24/7 emergency service available.",
                icon: "fa-bolt",
                subs: [
                    {n:"Visit & Inspection", p:250, d:"Diagnosis charge (Waived if service taken)", popular: false},
                    {n:"Switch/Socket Repair", p:275, d:"Per switchboard unit", popular: true},
                    {n:"Fan Installation", p:385, d:"Ceiling fan assembly & hanging", popular: false},
                    {n:"Fan Replacement", p:330, d:"Replace old with new", popular: false},
                    {n:"Tube Light Install", p:220, d:"Wall mounting & connection", popular: false},
                    {n:"MCB Replacement", p:440, d:"Fuse box repair/upgrade", popular: false},
                    {n:"New Point Wiring", p:880, d:"Internal wiring per point", popular: false},
                    {n:"Inverter Connection", p:330, d:"Battery & Inverter setup", popular: false},
                    {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
                ]
            },
            "carpenter": { 
                name: "Expert Carpentry", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800",
                desc:"Professional deep cleaning that goes beyond the daily broom. Restore absolute sanity and hygiene to your home instantly.",
                icon: "deepcleaning",
                subs: [
                    {n:"Full House Deep Cleaning", p:1999, d:"Assessment & measurement", popular: false},
                    
                ]
            },
            "deepcleaning": { 
                name: "Deep Cleaning", image: "",
                desc: "Furniture assembly, door repairs, and custom woodwork. Precision craftsmanship guaranteed.",
                icon: "fa-hammer",
                subs: [
                    {n:"Visit & Inspection", p:299, d:"Assessment & measurement", popular: false},
                    {n:"Furniture Assembly", p:440, d:"Bed, wardrobe, table", popular: true},
                    {n:"Door Hinge Repair", p:275, d:"Fixing creaking/loose doors", popular: false},
                    {n:"Drawer Channel Fix", p:330, d:"Smooth sliding repair", popular: false},
                    {n:"Lock Installation", p:350, d:"Door/Cupboard lock", popular: false},
                    {n:"Wooden Bed Repair", p:550, d:"Structural fix & tightening", popular: false},
                    {n:"Cupboard Alignment", p:385, d:"Door balancing", popular: false},
                    {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
                ]
            },
                
            "plumber": { 
                name: "Professional Plumbing", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800",
                desc: "Leakage fixing, tap installation, and blockage removal. Same-day service available.",
                icon: "fa-wrench",
                subs: [
                    {n:"Visit & Inspection", p:250, d:"Leak detection & quote", popular: false},
                    {n:"Tap Replacement", p:275, d:"Per tap installation", popular: true},
                    {n:"Wash Basin Install", p:440, d:"Wall mounting & sealant", popular: false},
                    {n:"Blockage Removal", p:440, d:"Sink/Pipe unclogging", popular: true},
                    {n:"Toilet Flush Repair", p:385, d:"Tank mechanism fix", popular: false},
                    {n:"Motor Connection", p:550, d:"Water pump setup", popular: false},
                    {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
                ]
            },
            "ac tech": { 
                name: "AC Repair & Service", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800",
                desc: "Cooling issues, gas refill, and deep cleaning. Keep your AC running efficiently.",
                icon: "fa-snowflake",
                subs: [
                    {n:"AC Inspection", p:330, d:"Diagnosis charge", popular: false},
                    {n:"Split AC Service", p:550, d:"Foam jet cleaning (Indoor+Outdoor)", popular: true},
                    {n:"Window AC Service", p:495, d:"Filter & coil cleaning", popular: false},
                    {n:"Gas Refill", p:2500, d:"Complete gas charging (R32/R410)", popular: false},
                    {n:"Installation", p:1650, d:"Split AC wall mounting", popular: false},
                    {n:"Uninstallation", p:770, d:"Safe removal with gas lock", popular: false},
                    {n:"Capacitor Change", p:650, d:"Starting problem fix", popular: false},
                    {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
                ]
            },
            "clean": { 
                name: "Deep Cleaning", image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800",
                desc: "Professional home deep cleaning and sanitization. Eco-friendly products used.",
                icon: "fa-broom",
                subs: [
                    {n:"1 BHK Deep Clean", p:1100, d:"Full house floor & dusting", popular: true},
                    {n:"2 BHK Deep Clean", p:1430, d:"Full house floor & dusting", popular: true},
                    {n:"Kitchen Deep Clean", p:880, d:"Oil stain & chimney removal", popular: false},
                    {n:"Bathroom Cleaning", p:660, d:"Acid wash & sanitization", popular: false},
                    {n:"Sofa Cleaning", p:770, d:"Shampoo wash (5 seater)", popular: false},
                    {n:"Move-in Cleaning", p:1650, d:"Empty house cleaning", popular: false},
                    {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
                ]
            },
            "default": {
                name: "General Service", image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800",
                desc: "Standard inspection and repair service. Quality guaranteed.",
                icon: "fa-tools",
                subs: [
                    {n:"Visit & Inspection", p:299, d:"Standard visit charge", popular: false},
                    {n:"Minor Repair", p:450, d:"Up to 1 hour work", popular: true},
                    {n:"Major Repair", p:850, d:"Complex technical work", popular: false},
                    {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
                ]
            }
        };

        const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';
        
        if (window.supabase) {
            window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
