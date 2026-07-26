
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
// --- MASTER SERVICE DATABASE ---
// --- MASTER SERVICE DATABASE (AMRAVATI MARKET REALISTIC EXHAUSTIVE PRICING) ---
const servicesDB = {
    // ==========================================
    // HOME SERVICES (Category: Home_cat)
    // ==========================================
    "electrician": {
        name: "Expert Electrician",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800",
        desc: "Certified electricians for residential and commercial electrical installation, repairs and maintenance.",
        icon: "fa-bolt",
        subs: [
            { n: "Electrical Inspection", p: 149, d: "Complete inspection and fault diagnosis. Adjusted in final bill if work is approved.", duration: "20-30 min", warranty: "N/A", material: false, is_inspection: true, popular: true },
            { n: "Emergency Electrician Visit", p: 249, d: "Urgent electrical inspection within service hours.", duration: "30 min", warranty: "N/A", material: false, is_inspection: true },
            { n: "Switch Replacement (1 Module)", p: 99, d: "Replace faulty switch. Customer supplied material.", duration: "15 min", warranty: "30 Days", material: false },
            { n: "Socket Replacement (5A)", p: 119, d: "Replace standard socket.", duration: "15-20 min", warranty: "30 Days", material: false },
            { n: "Socket Replacement (15A)", p: 169, d: "Heavy duty socket replacement.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "Switchboard Repair", p: 199, d: "Repair loose connections and faulty modules.", duration: "30-45 min", warranty: "30 Days", material: false, popular: true },
            { n: "Complete Switchboard Replacement", p: 349, d: "Replace complete modular board.", duration: "45-60 min", warranty: "30 Days", material: false },
            { n: "Fan Regulator Replacement", p: 119, d: "Replace old regulator.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "Dimmer Installation", p: 149, d: "Install light dimmer.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "Ceiling Fan Installation", p: 229, d: "Install new ceiling fan.", duration: "40 min", warranty: "30 Days", material: false, popular: true },
            { n: "Ceiling Fan Replacement", p: 219, d: "Replace existing fan.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "Ceiling Fan Repair", p: 199, d: "Repair noisy or slow fan.", duration: "30-45 min", warranty: "30 Days", material: false },
            { n: "BLDC / Smart Fan Installation", p: 249, d: "Install smart remote-operated BLDC fan.", duration: "40 min", warranty: "30 Days", material: false },
            { n: "Exhaust Fan Installation", p: 229, d: "Install exhaust fan.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "Exhaust Fan Repair", p: 179, d: "Repair exhaust fan.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "LED Bulb Installation", p: 49, d: "Install customer supplied LED bulb.", duration: "10 min", warranty: "7 Days", material: false },
            { n: "Tube Light Installation", p: 119, d: "Install LED tube light.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "LED Panel Light Installation", p: 169, d: "Install ceiling panel light.", duration: "25 min", warranty: "30 Days", material: false },
            { n: "Wall Light Installation", p: 179, d: "Install decorative wall light.", duration: "25 min", warranty: "30 Days", material: false },
            { n: "Chandelier Installation", p: 599, d: "Install decorative chandelier.", duration: "90-120 min", warranty: "30 Days", material: false },
            { n: "Profile / Strip Light Installation", p: 349, d: "Install LED strip & aluminum channel (per 5m).", duration: "45 min", warranty: "30 Days", material: false },
            { n: "Outdoor Light Installation", p: 229, d: "Install outdoor lighting.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "Garden Light Installation", p: 249, d: "Install garden lights.", duration: "40 min", warranty: "30 Days", material: false },
            { n: "Motion Sensor Light Installation", p: 329, d: "Install motion sensor light.", duration: "45 min", warranty: "30 Days", material: false },
            { n: "New 5A Electrical Point", p: 349, d: "Labour only.", duration: "45-60 min", warranty: "30 Days", material: false, popular: true },
            { n: "New 15A Electrical Point", p: 499, d: "Heavy load point.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Concealed Wiring Repair", p: 449, d: "Minor concealed wiring repair.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Surface Casing Wiring", p: 299, d: "PVC casing wiring labour (per 5m).", duration: "45 min", warranty: "30 Days", material: false },
            { n: "Short Circuit Repair", p: 449, d: "Locate and repair short circuit.", duration: "60-90 min", warranty: "30 Days", material: false, popular: true },
            { n: "House Rewiring", p: 1799, d: "Labour charges only per floor. Final quotation after inspection.", duration: "Variable", warranty: "90 Days", material: false },
            { n: "MCB Replacement", p: 169, d: "Replace faulty single-pole MCB.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "MCB Tripping Repair", p: 199, d: "Diagnose tripping issues.", duration: "40 min", warranty: "30 Days", material: false },
            { n: "Distribution Board Repair", p: 399, d: "Repair DB connections.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Distribution Board Installation", p: 699, d: "Install customer supplied DB board.", duration: "90 min", warranty: "30 Days", material: false },
            { n: "Sub-meter Installation", p: 299, d: "Install individual sub-meter.", duration: "45 min", warranty: "30 Days", material: false },
            { n: "Inverter Installation", p: 449, d: "Install inverter and battery setup.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Inverter Battery Water Top-up", p: 199, d: "Distilled water filling & terminal cleaning.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "Inverter Uninstallation", p: 299, d: "Safely remove inverter connection.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "UPS / Stabilizer Installation", p: 199, d: "Install TV / Main stabilizer.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "Door Bell Installation", p: 129, d: "Install standard door bell.", duration: "20 min", warranty: "30 Days", material: false },
            { n: "Video Doorbell Installation", p: 499, d: "Install camera-enabled video doorbell.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Geyser Electrical Connection", p: 229, d: "Electrical connection & MCB check.", duration: "30 min", warranty: "30 Days", material: false },
            { n: "AC Power Point Installation", p: 399, d: "Dedicated heavy duty AC point.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Water Pump Wiring", p: 279, d: "Motor wiring connection and starter check.", duration: "40 min", warranty: "30 Days", material: false },
            { n: "Earthing Check & Repair", p: 249, d: "Check earthing resistance and repair connections.", duration: "30 min", warranty: "N/A", material: false },
            { n: "Voltage Testing", p: 149, d: "Check voltage fluctuations.", duration: "20 min", warranty: "N/A", material: false },
            { n: "Shop / Office Electrical Repair", p: 549, d: "Commercial electrical maintenance.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Commercial Meter Board Repair", p: 449, d: "Repair meter board connections.", duration: "60 min", warranty: "30 Days", material: false },
            { n: "Other Electrical Issue", p: 149, d: "Inspection fee adjusted in final bill if work is approved.", duration: "20-30 min", warranty: "N/A", material: false, is_inspection: true, popular: true }
        ]
    },
    "carpenter": { 
        name: "Expert Carpentry", 
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800",
        desc: "Furniture assembly, door repairs, and custom woodwork. Precision craftsmanship guaranteed.",
        icon: "fa-hammer",
        subs: [
            { n: "Visit & Inspection", p: 199, d: "Assessment & measurement", popular: false, is_inspection: true },
            { n: "Furniture Assembly (Bed/Table)", p: 349, d: "Bed, wardrobe, or table assembly.", popular: true },
            { n: "Wardrobe / Cabinet Assembly", p: 499, d: "Modular wardrobe setup.", popular: false },
            { n: "Door Hinge Repair / Swap", p: 179, d: "Fixing creaking/loose doors or replacing hinges.", popular: false },
            { n: "Door Latch & Bolt Fitting", p: 149, d: "Installing tower bolt or door latch.", popular: false },
            { n: "Door Handle & Knob Fitting", p: 129, d: "Installing premium handle set.", popular: false },
            { n: "Door Stopper Fitting", p: 99, d: "Installing magnetic or rubber door stopper.", popular: false },
            { n: "Door Peep Hole Eye Fitting", p: 119, d: "Drilling & installing door eye.", popular: false },
            { n: "Door Lock (Mortise/Aldrop) Fitting", p: 249, d: "Installing new main door lock.", popular: false },
            { n: "Smart / Digital Lock Fitting", p: 599, d: "Precision cutting & installing digital smart lock.", popular: true },
            { n: "Drawer Channel / Slide Repair", p: 229, d: "Smooth sliding channel fix/replacement.", popular: false },
            { n: "Drawer Lock Fitting", p: 149, d: "Installing desk or cabinet drawer lock.", popular: false },
            { n: "Wooden Bed Repair & Tightening", p: 349, d: "Structural fix & joint tightening.", popular: false },
            { n: "Hydraulic Bed Lift Repair", p: 499, d: "Replacing or repairing bed hydraulic pump.", popular: false },
            { n: "Cupboard Door Realignment", p: 249, d: "Door balancing & hinge adjustment.", popular: false },
            { n: "Wall Shelf / Rack Fitting", p: 199, d: "Hanging decorative floating shelves.", popular: false },
            { n: "Curtain Rod Installation", p: 149, d: "Fitting curtain brackets & rods.", popular: false },
            { n: "Wooden Door Trimming / Shaving", p: 249, d: "Shaving bottom edge of expanding doors.", popular: false },
            { n: "TV Wall Unit Fitting", p: 399, d: "Assembly & wall mounting TV cabinet.", popular: false },
            { n: "Sofa Frame / Leg Repair", p: 299, d: "Fixing broken sofa support legs or wood frame.", popular: false },
            { n: "Modular Kitchen Hinge Repair", p: 299, d: "Auto-close hydraulic hinge fix.", popular: false },
            { n: "Sliding Wardrobe Door Repair", p: 349, d: "Roller channel repair & alignment.", popular: false },
            { n: "Window Latch & Mesh Fix", p: 229, d: "Wooden window latch or mesh frame repair.", popular: false },
            { n: "Other Carpentry Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "cleaning": { 
        name: "Professional Cleaning", 
        image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800",
        desc: "Professional deep cleaning that goes beyond the daily broom. Restore absolute sanity and hygiene to your home instantly.",
        icon: "fa-broom",
        subs: [
            { n: "Full House Deep Clean (1 BHK)", p: 1299, d: "Complete deep cleaning for 1 BHK apartment.", popular: true },
            { n: "Full House Deep Clean (2 BHK)", p: 1799, d: "Complete deep cleaning for 2 BHK apartment.", popular: true },
            { n: "Full House Deep Clean (3 BHK)", p: 2299, d: "Complete deep cleaning for 3 BHK apartment.", popular: false },
            { n: "Bathroom Deep Disinfection (1 Bath)", p: 349, d: "Hard-water scale removal, tile scrubbing, and sanitization.", popular: true },
            { n: "Bathroom Deep Disinfection (2 Baths)", p: 649, d: "Combo offer for two bathrooms.", popular: false },
            { n: "Sofa Upholstery Spa (Per Seat)", p: 129, d: "Mechanized wet shampoo extraction wash per seat.", popular: false },
            { n: "Carpet Deep Wet Wash", p: 399, d: "Shampoo scrubbing & vacuum extraction for carpets.", popular: false },
            { n: "Mattress Steam Clean", p: 499, d: "Sanitization & dust-mite elimination for bed mattress.", popular: false },
            { n: "Kitchen Degreasing & Cabinet Clean", p: 799, d: "Oil stain removal from backsplashes, slabs & cabinets.", popular: true },
            { n: "Kitchen Chimney Cleaning", p: 399, d: "Mesh filter cleaning & outer body degreasing.", popular: false },
            { n: "Refrigerator Deep Cleaning", p: 349, d: "Internal trays wet washing & odor removal treatment.", popular: false },
            { n: "Balcony & Terrace Power Wash", p: 349, d: "High-pressure floor jet cleaning.", popular: false },
            { n: "Glass Window & Grill Cleaning", p: 299, d: "Scrubbing window panes & dust removal from grills.", popular: false },
            { n: "Overhead Water Tank Cleaning (1000L)", p: 399, d: "High-pressure silt evacuation and antibacterial treatment.", popular: false },
            { n: "Underground Sump Tank Cleaning", p: 699, d: "Sludge removal & sanitization for ground tanks.", popular: false },
            { n: "Move-In / Vacant House Cleaning", p: 1499, d: "Specialized post-construction or pre-moving deep clean.", popular: false }
        ]
    },
    "plumber": {
        name: "Expert Plumber",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800",
        desc: "Professional plumbing services for homes and commercial properties.",
        icon: "fa-faucet",
        subs: [
            { id: "plumbing-inspection", slug: "plumbing-inspection", category: "plumber", subCategory: "inspection", n: "Plumbing Inspection", p: 149, minPrice: 149, maxPrice: 149, priceType: "inspection", d: "Inspection and diagnosis of plumbing issues. Adjusted if service booked.", duration: "20-30 min", warranty: "N/A", materialIncluded: false, popular: true, inspection: true, skillLevel: "basic", tags: ["Inspection", "Leak", "Diagnosis"] },
            { id: "emergency-plumber-visit", slug: "emergency-plumber-visit", category: "plumber", subCategory: "inspection", n: "Emergency Plumber Visit", p: 249, minPrice: 249, maxPrice: 249, priceType: "inspection", d: "Urgent plumbing visit during working hours.", duration: "30 min", warranty: "N/A", materialIncluded: false, inspection: true, skillLevel: "basic", tags: ["Emergency", "Visit"] },
            { id: "tap-repair", slug: "tap-repair", category: "plumber", subCategory: "tap", n: "Tap Repair / Washer Change", p: 129, minPrice: 129, maxPrice: 129, priceType: "fixed", d: "Fix dripping tap or replace internal washer.", duration: "20 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "basic", tags: ["Tap", "Repair"] },
            { id: "tap-installation", slug: "tap-installation", category: "plumber", subCategory: "tap", n: "Tap Installation / Replacement", p: 149, minPrice: 149, maxPrice: 149, priceType: "fixed", d: "Installation of customer supplied tap.", duration: "20-30 min", warranty: "30 Days", materialIncluded: false, popular: false, inspection: false, skillLevel: "basic", tags: ["Tap", "Installation"] },
            { id: "angle-valve-replacement", slug: "angle-valve-replacement", category: "plumber", subCategory: "tap", n: "Angle Valve / Stop Cock Replacement", p: 169, minPrice: 169, maxPrice: 169, priceType: "fixed", d: "Replace faulty wall stop cock valve.", duration: "20 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Valve", "Stopcock"] },
            { id: "mixer-tap-installation", slug: "mixer-tap-installation", category: "plumber", subCategory: "tap", n: "Wall Mixer / Diverter Tap Fitting", p: 299, minPrice: 299, maxPrice: 299, priceType: "fixed", d: "Install shower mixer tap unit.", duration: "30-45 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "intermediate", tags: ["Mixer", "Tap"] },
            { id: "shower-head-installation", slug: "shower-head-installation", category: "plumber", subCategory: "bath", n: "Shower Head / Arm Fitting", p: 149, minPrice: 149, maxPrice: 149, priceType: "fixed", d: "Fit overhead shower wall arm & nozzle.", duration: "20 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Shower"] },
            { id: "jet-spray-installation", slug: "jet-spray-installation", category: "plumber", subCategory: "toilet", n: "Health Faucet / Jet Spray Fitting", p: 149, minPrice: 149, maxPrice: 149, priceType: "fixed", d: "Install jet spray near toilet.", duration: "20 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "basic", tags: ["Jet Spray"] },
            { id: "jet-spray-pipe-change", slug: "jet-spray-pipe-change", category: "plumber", subCategory: "toilet", n: "Jet Spray Hose Pipe Change", p: 129, minPrice: 129, maxPrice: 129, priceType: "fixed", d: "Replace leaking flexible health faucet hose.", duration: "15 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Hose", "Jet Spray"] },
            { id: "wash-basin-installation", slug: "wash-basin-installation", category: "plumber", subCategory: "basin", n: "Wash Basin Fitting", p: 449, minPrice: 449, maxPrice: 449, priceType: "fixed", d: "Install ceramic wash basin.", duration: "60 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "intermediate", tags: ["Wash Basin"] },
            { id: "wash-basin-waste-coupling", slug: "wash-basin-waste-coupling", category: "plumber", subCategory: "basin", n: "Waste Coupling Replacement", p: 199, minPrice: 199, maxPrice: 199, priceType: "fixed", d: "Replace rusted bottom drain valve.", duration: "30 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Basin", "Coupling"] },
            { id: "wash-basin-leakage", slug: "wash-basin-leakage", category: "plumber", subCategory: "basin", n: "Wash Basin Drain Leak Repair", p: 229, minPrice: 229, maxPrice: 229, priceType: "fixed", d: "Repair basin bottle trap leakage.", duration: "30 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Wash Basin", "Leak"] },
            { id: "kitchen-sink-installation", slug: "kitchen-sink-installation", category: "plumber", subCategory: "sink", n: "Kitchen Stainless Sink Fitting", p: 599, minPrice: 599, maxPrice: 599, priceType: "fixed", d: "Mount new sink on counter.", duration: "60-90 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "intermediate", tags: ["Kitchen", "Sink"] },
            { id: "kitchen-sink-blockage", slug: "kitchen-sink-blockage", category: "plumber", subCategory: "sink", n: "Kitchen Sink Blockage Removal", p: 299, minPrice: 299, maxPrice: 299, priceType: "fixed", d: "Clear clogged sink drain pipe.", duration: "30-45 min", warranty: "15 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "intermediate", tags: ["Kitchen", "Sink", "Clog"] },
            { id: "indian-toilet-repair", slug: "indian-toilet-repair", category: "plumber", subCategory: "toilet", n: "Indian Toilet Repair / Fitting", p: 599, minPrice: 599, maxPrice: 599, priceType: "fixed", d: "Repair or fit Indian squatting pan.", duration: "90 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "advanced", tags: ["Indian Toilet"] },
            { id: "western-toilet-installation", slug: "western-toilet-installation", category: "plumber", subCategory: "toilet", n: "Floor Mounted Western WC Fitting", p: 749, minPrice: 749, maxPrice: 749, priceType: "fixed", d: "Install customer supplied western WC.", duration: "90 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "advanced", tags: ["Toilet", "WC"] },
            { id: "wall-mounted-wc-repair", slug: "wall-mounted-wc-repair", category: "plumber", subCategory: "toilet", n: "Wall Mounted WC / Concealed Flush Repair", p: 899, minPrice: 899, maxPrice: 899, priceType: "fixed", d: "Fix concealed wall flush mechanism.", duration: "90 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "advanced", tags: ["Wall WC", "Flush"] },
            { id: "toilet-seat-cover", slug: "toilet-seat-cover", category: "plumber", subCategory: "toilet", n: "Toilet Seat Cover Fitting", p: 119, minPrice: 119, maxPrice: 119, priceType: "fixed", d: "Replace plastic seat cover.", duration: "15 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Seat Cover"] },
            { id: "toilet-blockage-removal", slug: "toilet-blockage-removal", category: "plumber", subCategory: "toilet", n: "Toilet Blockage Removal", p: 399, minPrice: 399, maxPrice: 399, priceType: "fixed", d: "Clear clogged toilet pan line.", duration: "45-60 min", warranty: "15 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "intermediate", tags: ["Toilet", "Blockage"] },
            { id: "flush-tank-repair", slug: "flush-tank-repair", category: "plumber", subCategory: "flush", n: "Flush Tank Internal Mechanism Repair", p: 249, minPrice: 249, maxPrice: 249, priceType: "fixed", d: "Repair float valve or siphon kit.", duration: "30-45 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "basic", tags: ["Flush", "Repair"] },
            { id: "flush-tank-replacement", slug: "flush-tank-replacement", category: "plumber", subCategory: "flush", n: "External Plastic Flush Tank Fitting", p: 449, minPrice: 449, maxPrice: 449, priceType: "fixed", d: "Mount new external flush tank.", duration: "45 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "intermediate", tags: ["Flush"] },
            { id: "drain-blockage", slug: "drain-blockage", category: "plumber", subCategory: "drain", n: "Floor Drain Trap Unclogging", p: 249, minPrice: 249, maxPrice: 249, priceType: "fixed", d: "Clear bathroom floor drain obstruction.", duration: "30 min", warranty: "15 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "intermediate", tags: ["Drain", "Blockage"] },
            { id: "pipe-leakage-repair", slug: "pipe-leakage-repair", category: "plumber", subCategory: "pipe", n: "CPVC / PVC Pipe Leakage Repair", p: 299, minPrice: 299, maxPrice: 299, priceType: "fixed", d: "Repair leaking water pipe segment.", duration: "45-60 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "intermediate", tags: ["Pipe", "Leak"] },
            { id: "pipe-replacement", slug: "pipe-replacement", category: "plumber", subCategory: "pipe", n: "Water Line Replacement Labour", p: 549, minPrice: 549, maxPrice: 549, priceType: "fixed", d: "Replace pipeline section. Material extra.", duration: "1-2 hrs", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "advanced", tags: ["Pipe", "Replacement"] },
            { id: "overhead-tank-installation", slug: "overhead-tank-installation", category: "plumber", subCategory: "tank", n: "Overhead Water Tank Fitting (Plastic)", p: 699, minPrice: 699, maxPrice: 699, priceType: "fixed", d: "Connect & fit roof tank.", duration: "2 hrs", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "advanced", tags: ["Tank"] },
            { id: "tank-ball-valve", slug: "tank-ball-valve", category: "plumber", subCategory: "tank", n: "Overhead Tank Ball Valve Fitting", p: 229, minPrice: 229, maxPrice: 229, priceType: "fixed", d: "Replace auto cut-off ball valve.", duration: "30 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Tank", "Ball Valve"] },
            { id: "water-motor-installation", slug: "water-motor-installation", category: "plumber", subCategory: "motor", n: "Water Pump / Motor Installation", p: 599, minPrice: 599, maxPrice: 599, priceType: "fixed", d: "Connect plumbing line to motor pump.", duration: "60-90 min", warranty: "30 Days", materialIncluded: false, popular: true, inspection: false, skillLevel: "advanced", tags: ["Pump", "Motor"] },
            { id: "water-motor-repair", slug: "water-motor-repair", category: "plumber", subCategory: "motor", n: "Water Pump Air Lock / Repair", p: 399, minPrice: 399, maxPrice: 399, priceType: "fixed", d: "Remove air lock or fix motor connections.", duration: "45 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "intermediate", tags: ["Pump", "Air Lock"] },
            { id: "ro-inlet-connection", slug: "ro-inlet-connection", category: "plumber", subCategory: "appliance", n: "RO Water Inlet Plumbing Point", p: 149, minPrice: 149, maxPrice: 149, priceType: "fixed", d: "Tap into pipe to create RO water feed valve.", duration: "20 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["RO", "Connection"] },
            { id: "washing-machine-tap", slug: "washing-machine-tap", category: "plumber", subCategory: "appliance", n: "Washing Machine Inlet Tap Fitting", p: 129, minPrice: 129, maxPrice: 129, priceType: "fixed", d: "Install special nozzle tap for washer hose.", duration: "20 min", warranty: "30 Days", materialIncluded: false, inspection: false, skillLevel: "basic", tags: ["Washing Machine"] },
            { id: "other-plumbing-issue", slug: "other-plumbing-issue", category: "plumber", subCategory: "other", n: "Other Plumbing Issue", p: 149, minPrice: 149, maxPrice: 149, priceType: "inspection", d: "Can't find your problem? Inspection fee adjusted in final bill.", duration: "20 min", warranty: "N/A", materialIncluded: false, inspection: true, skillLevel: "basic", tags: ["Other"] }
        ]
    },
    "painter": {
        name: "Premium Painting",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800",
        desc: "Interior wall textures, waterproof coats, and exterior emulsion painting done by experts.",
        icon: "fa-paint-roller",
        subs: [
            { n: "Wall Inspection & Moisture Test", p: 199, d: "Moisture level check & wall measuring test.", popular: false, is_inspection: true },
            { n: "Single Room Refresh Coat", p: 2499, d: "Quick touchup & double color coat for single room.", popular: true },
            { n: "Full House Interior Painting (Per Day Labour)", p: 1499, d: "Experienced painter per day labour rate.", popular: false },
            { n: "Exterior Wall Emulsion Coating", p: 1999, d: "Weather-proof exterior wall painting per 500 sq.ft.", popular: false },
            { n: "Accent Wall Texture Painting", p: 1599, d: "Decorative pattern design on single accent wall.", popular: true },
            { n: "Wall Dampness & Waterproofing Coat", p: 899, d: "Anti-dampness chemical treatment per wall.", popular: false },
            { n: "Wall Putty & Sanding (Per Room)", p: 799, d: "Applying double putty layer & machine sanding.", popular: false },
            { n: "Door & Window Enamel Paint", p: 399, d: "Oil-based gloss paint per door or window frame.", popular: false },
            { n: "Metal Grill Anti-Rust Painting", p: 299, d: "Primer + enamel coat for window safety grills.", popular: false },
            { n: "Wood Polish / Melamine Finish", p: 999, d: "Sanding & melamine polish for wooden furniture/doors.", popular: false },
            { n: "Water Stain Spot Touchup", p: 499, d: "Scraping & painting water damaged ceiling/wall patch.", popular: false },
            { n: "Wall Stencil Design Painting", p: 899, d: "Decorative stencil art setup.", popular: false },
            { n: "POP / Ceiling Crack Repair & Paint", p: 599, d: "Fixing ceiling plaster flakes & repainting.", popular: false },
            { n: "Other Painting Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "mason": {
        name: "Expert Masonry Work",
        image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800",
        desc: "Bricklaying, wall plastering, tile replacements, and cement structural adjustments.",
        icon: "fa-trowel",
        subs: [
            { n: "Site Survey & Measurement", p: 199, d: "Architectural measurement & material estimate.", popular: false, is_inspection: true },
            { n: "Floor / Wall Tile Patching Repair", p: 349, d: "Fixing broken tile pieces or re-grouting joints.", popular: true },
            { n: "Tile Laying Labour (Per Day)", p: 599, d: "Expert tile mason daily labor rate.", popular: false },
            { n: "Wall Cement Plastering (Patch Work)", p: 699, d: "Cement plastering for cracked wall surface.", popular: false },
            { n: "Concrete Floor / Ceiling Crack Seal", p: 499, d: "V-cut crack sealing with waterproof cement paste.", popular: false },
            { n: "Brickwork Partition Wall (Per 50 Sq.Ft)", p: 899, d: "Red brick / fly-ash block construction.", popular: false },
            { n: "Door / Window Frame Cement Grouting", p: 399, d: "Filling gap between new door frame & brick wall.", popular: false },
            { n: "Bathroom Waterproofing Screed", p: 1299, d: "Chemical screed plaster before tile laying.", popular: false },
            { n: "Granite Slab Cutting & Setting", p: 1499, d: "Kitchen counter granite installation labour.", popular: false },
            { n: "Kota / Marble Floor Polishing", p: 999, d: "Machine grinding & polishing per 100 sq.ft.", popular: false },
            { n: "Boundary Wall Repair Work", p: 799, d: "Fixing broken plaster or loose bricks.", popular: false },
            { n: "Other Masonry Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "welder": {
        name: "Metal Fabrication & Welding",
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800",
        desc: "Gate alignment, grill reinforcement, spot welding, and industrial-grade shield fabrication.",
        icon: "fa-screwdriver",
        subs: [
            { n: "Welding Inspection & Estimate", p: 199, d: "Structural check & damage analysis.", popular: false, is_inspection: true },
            { n: "Main Gate Hinge / Latch Spot Welding", p: 349, d: "Fixing sagging main iron gates.", popular: true },
            { n: "Safety Grill Cutting & Modification", p: 499, d: "Cutting or expanding window/door grills.", popular: false },
            { n: "Window Grill Repair & Re-alignment", p: 399, d: "Welding loose grill joints.", popular: false },
            { n: "Rolling Shutter Channel Repair", p: 699, d: "Commercial shutter lock & spring welding fix.", popular: false },
            { n: "Staircase Handrail Welding Fix", p: 499, d: "Reinforcing loose iron/steel railings.", popular: false },
            { n: "Iron Furniture / Bed Welding Repair", p: 299, d: "Fixing cracked iron bed frames or chairs.", popular: false },
            { n: "Shed Metal Sheet / Pipe Truss Repair", p: 899, d: "Fixing leaking or loose roof sheet structure.", popular: false },
            { n: "Custom Bracket Fabrication", p: 399, d: "Making heavy duty wall support brackets.", popular: false },
            { n: "Other Welding Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },

    // ==========================================
    // APPLIANCE REPAIR (Category: Appliance)
    // ==========================================
    "ac tech": { 
        name: "AC Repair & Service", 
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800",
        desc: "Cooling issues, gas refill, and deep cleaning. Keep your AC running efficiently.",
        icon: "fa-snowflake",
        subs: [
            { n: "AC Diagnostic Check", p: 199, d: "Cooling and electrical diagnostics. Adjusted in final bill.", popular: false, is_inspection: true },
            { n: "Split AC Foam-Jet Wash", p: 449, d: "Indoor foam jet & outdoor coil pressure wash.", popular: true },
            { n: "Window AC Deep Cleaning", p: 399, d: "Filter cleaning & high-pressure jet wash.", popular: false },
            { n: "AC Gas Leak Test & Full Gas Refill", p: 2199, d: "Pressure testing, leak repair & full gas charge (R32/R410/R22).", popular: true },
            { n: "AC Gas Top-Up", p: 1299, d: "Minor gas top up for mild cooling loss.", popular: false },
            { n: "Split AC Wall Mounting", p: 1199, d: "Standard indoor & outdoor unit installation.", popular: false },
            { n: "Split AC Uninstallation", p: 499, d: "Safe unmounting with refrigerant lock.", popular: false },
            { n: "Window AC Installation", p: 699, d: "Window frame mounting & sealing.", popular: false },
            { n: "Window AC Uninstallation", p: 399, d: "Safe removal from window frame.", popular: false },
            { n: "Outdoor Stand Fitting", p: 299, d: "Mounting iron stand brackets on exterior wall.", popular: false },
            { n: "Capacitor Replacement", p: 399, d: "Replacing starting/running capacitor.", popular: false },
            { n: "AC Fan Motor Replacement", p: 699, d: "Fixing non-functional blower/fan motor.", popular: false },
            { n: "AC PCB Circuit Board Repair", p: 1499, d: "Electronic board circuit repair.", popular: false },
            { n: "Copper Pipe Extension (Per Meter)", p: 349, d: "Insulated copper pipe laying labour.", popular: false },
            { n: "AC Water Leakage Clearance", p: 299, d: "Clearing clogged drain tray and hose.", popular: false },
            { n: "Thermostat / Sensor Change", p: 449, d: "Replacing faulty temperature sensor.", popular: false },
            { n: "Remote Control Sync & Setup", p: 199, d: "Universal remote programming.", popular: false },
            { n: "Other AC Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "fridge": {
        name: "Refrigerator Expert",
        image: "https://images.unsplash.com/photo-1571175432247-5b86d4c3bda3?auto=format&fit=crop&w=800",
        desc: "Single door, double door, and side-by-side refrigerator compressor and sensor fixing.",
        icon: "fa-refrigerator",
        subs: [
            { n: "Refrigerator Diagnostic Check", p: 199, d: "Compressor loop & thermostat inspection.", popular: false, is_inspection: true },
            { n: "Single Door General Service", p: 299, d: "Coil vacuuming & defrost check.", popular: false },
            { n: "Double Door General Service", p: 399, d: "Sensor check, drain cleaning & fan service.", popular: false },
            { n: "Gas Refill & Capillary Cleaning", p: 1499, d: "Flushing capillary tube & fresh refrigerant charging.", popular: true },
            { n: "Compressor Replacement Labour", p: 999, d: "Installing new compressor unit.", popular: false },
            { n: "Thermostat Replacement", p: 449, d: "Fixing temperature over-cooling or no-cooling.", popular: false },
            { n: "Relay / OLP Starter Kit Fitting", p: 399, d: "Fixes clicking sound and starting trouble.", popular: false },
            { n: "Defrost Timer Module Replacement", p: 599, d: "Fixes ice build-up in freezer.", popular: false },
            { n: "Evaporator Fan Motor Replacement", p: 499, d: "Replacing noisy or dead circulation fan.", popular: false },
            { n: "Door Gasket Rubber Seal Replacement", p: 349, d: "Replacing loose air-leak door rubber.", popular: false },
            { n: "Inverter PCB Card Repair", p: 1299, d: "Fixing electronic control board error.", popular: false },
            { n: "Drainage Line Unclogging", p: 299, d: "Clearing internal water leakage into vegetable tray.", popular: false },
            { n: "Bulb / LED Light Replacement", p: 149, d: "Fixing dead interior fridge light.", popular: false },
            { n: "Other Fridge Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "washing m.": {
        name: "Washing Machine Service",
        image: "https://images.unsplash.com/photo-1610557892470-55d9e80e0bce?auto=format&fit=crop&w=800",
        desc: "Top load and front load washer component fixes, drum balancing, and spin motor diagnostics.",
        icon: "fa-soap",
        subs: [
            { n: "Machine Diagnostic Check", p: 199, d: "Hardware diagnostic cycle.", popular: false, is_inspection: true },
            { n: "Top Load General Service", p: 399, d: "Filter cleaning, tub descaling check & calibration.", popular: false },
            { n: "Front Load General Service", p: 499, d: "Rubber door seal cleaning, filter flush & drum check.", popular: false },
            { n: "Semi-Automatic General Service", p: 299, d: "Spin & wash tub cleaning & belt check.", popular: false },
            { n: "Drain Pump Replacement", p: 549, d: "Resolving stuck water / non-draining issues.", popular: true },
            { n: "Inlet Solenoid Valve Replacement", p: 399, d: "Fixing slow or zero water intake errors.", popular: false },
            { n: "Spin / Wash Motor Capacitor Fix", p: 349, d: "Fixing motor hum without rotation.", popular: false },
            { n: "Drum Suspension Rod Swap", p: 699, d: "Fixing violent shaking/knocking during spin.", popular: false },
            { n: "Drive Belt Replacement", p: 299, d: "Replacing loose or snapped motor belt.", popular: false },
            { n: "Gearbox Refurbishment / Change", p: 1199, d: "Fixing center agitator rotation lock.", popular: false },
            { n: "PCB Main Controller Repair", p: 1399, d: "Fixing power errors & panel glitch.", popular: false },
            { n: "Pressure Switch Sensor Swap", p: 449, d: "Fixing water overflow / incorrect sensing.", popular: false },
            { n: "Front Load Door Bellow Gasket Swap", p: 499, d: "Replacing leaking rubber door ring.", popular: false },
            { n: "Other Washing Machine Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "microwave": {
        name: "Microwave Oven Care",
        image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800",
        desc: "Magnetron replacement, high voltage transformer fixes, and touch pad interface repairs.",
        icon: "fa-dumpster-fire",
        subs: [
            { n: "Microwave Diagnostic Check", p: 149, d: "Sparking or zero heating diagnostic loop.", popular: false, is_inspection: true },
            { n: "Magnetron Replacement", p: 899, d: "Fixes system running but not heating food.", popular: true },
            { n: "High-Voltage Transformer Repair", p: 799, d: "Fixes dead system or blown fuse error.", popular: false },
            { n: "High-Voltage Diode / Fuse Swap", p: 249, d: "Restoring power to heating coil.", popular: false },
            { n: "Turntable Motor Replacement", p: 349, d: "Fixes glass plate rotation lock.", popular: false },
            { n: "Touch Membrane Panel Repair", p: 599, d: "Fixing non-responsive touch keypads.", popular: false },
            { n: "Door Latch / Microswitch Fix", p: 299, d: "Fixes microwave turning off when door moves.", popular: false },
            { n: "Mica Waveguide Sheet Change", p: 199, d: "Fixing internal sparking issue.", popular: false },
            { n: "Other Microwave Issue", p: 149, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "ro filter": {
        name: "Water Purifier & RO Care",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800",
        desc: "TDS profiling, filter element scaling clearance, sediment swaps, and booster pump repairs.",
        icon: "fa-faucet-drip",
        subs: [
            { n: "RO Diagnostic & TDS Test", p: 149, d: "Water purity evaluation and filter efficiency check.", popular: false, is_inspection: true },
            { n: "RO General Service & Sanitization", p: 299, d: "Tank cleaning & pipe flush.", popular: false },
            { n: "Pre-Filter Candle Replacement", p: 249, d: "Outer pre-filter housing cleaning & candle change.", popular: true },
            { n: "Complete Filter Kit Replacement", p: 899, d: "Sediment + Carbon + RO Membrane comprehensive replacement.", popular: true },
            { n: "RO Booster Pump Replacement", p: 1299, d: "Restores raw input operational pressure.", popular: false },
            { n: "Solenoid Valve (SV) / SMPS Fix", p: 399, d: "Fixes auto shutoff or power failure loop.", popular: false },
            { n: "RO Pipe Leakage & Connector Change", p: 199, d: "Fixing water dripping from elbows or tube joints.", popular: false },
            { n: "UV Lamp / UF Membrane Change", p: 449, d: "Disinfection UV tube replacement.", popular: false },
            { n: "Auto Cut-Off Float Switch Repair", p: 249, d: "Fixes tank overflow issue.", popular: false },
            { n: "RO Dispenser Tap Replacement", p: 149, d: "Replacing loose water tap on RO body.", popular: false },
            { n: "Other RO Issue", p: 149, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },

    // ==========================================
    // ELECTRONICS (Category: Electronics)
    // ==========================================
    "tv / led": {
        name: "TV & LED Panel Repair",
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800",
        desc: "Wall mounting setup, backlight string restoration, and motherboard card replacement.",
        icon: "fa-tv",
        subs: [
            { n: "TV Panel Diagnosis & Scan", p: 199, d: "Display glitch or sound test assessment.", popular: false, is_inspection: true },
            { n: "Wall Mount Installation (Up to 43\")", p: 249, d: "Standard wall bracket installation.", popular: true },
            { n: "Wall Mount Installation (Above 43\")", p: 399, d: "Heavy duty wall mounting.", popular: false },
            { n: "TV Table Stand Assembly", p: 149, d: "Fitting base legs/stand on TV.", popular: false },
            { n: "TV Uninstallation", p: 199, d: "Safely unmounting TV from wall bracket.", popular: false },
            { n: "LED Backlight Strip Replacement", p: 1399, d: "Resolves 'sound present but no display screen' issue.", popular: true },
            { n: "Motherboard / Power Supply Repair", p: 1199, d: "Fixes dead power or logo loop screen.", popular: false },
            { n: "Internal Speaker Replacement", p: 499, d: "Fixing crackling or muted TV audio.", popular: false },
            { n: "HDMI / AV Port Repair", p: 399, d: "Fixing loose set-top box input ports.", popular: false },
            { n: "Remote Control Setup & Sync", p: 149, d: "Pairing Bluetooth or Smart TV remote.", popular: false },
            { n: "Other TV Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "cctv": {
        name: "CCTV Security Systems",
        image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800",
        desc: "Camera mounting, coaxial channel wiring, DVR configuration, and remote app viewing sync.",
        icon: "fa-video",
        subs: [
            { n: "CCTV System Inspection", p: 199, d: "Video loss or power supply check.", popular: false, is_inspection: true },
            { n: "Single Camera Mounting (Bullet/Dome)", p: 229, d: "Physical mounting & BNC connection per node.", popular: true },
            { n: "DVR / NVR Hard Drive Configuration", p: 399, d: "Recording timeline & HDD storage setup.", popular: false },
            { n: "Mobile Remote App View Sync", p: 249, d: "IP configuration for live streaming on smartphone.", popular: true },
            { n: "BNC / DC Power Connector Replacement", p: 149, d: "Fixing flickering or loose video feed line.", popular: false },
            { n: "CCTV Power Supply Unit (SMPS) Swap", p: 349, d: "Replacing multi-channel power box.", popular: false },
            { n: "Coaxial Cable Wire Laying (Per 10m)", p: 199, d: "Neat casing/conduit cable routing labour.", popular: false },
            { n: "Wi-Fi Smart Camera Setup", p: 249, d: "Setting up indoor wireless camera with app.", popular: false },
            { n: "Video Loss Troubleshooting", p: 299, d: "Tracing cable cuts & repairing signal loss.", popular: false },
            { n: "Other CCTV Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },

    // ==========================================
    // AUTOMOTIVE (Category: Auto)
    // ==========================================
    "car mech": {
        name: "On-Demand Car Mechanic",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800",
        desc: "Battery jumpstarts, brake shoe adjustments, engine oil flushes, and roadside diagnostics.",
        icon: "fa-car",
        subs: [
            { n: "Car OBD Computer Scan & Check", p: 299, d: "Computerized error code scan & sensor diagnostics.", popular: false, is_inspection: true },
            { n: "Emergency Battery Jumpstart", p: 249, d: "Heavy cable booster deployment for dead battery.", popular: true },
            { n: "Flat Tyre Spare Wheel Change", p: 199, d: "Jacking car & mounting spare tyre.", popular: false },
            { n: "Front Disc Brake Pad Swap", p: 449, d: "Removing old pads, fitting new pads & caliper cleaning.", popular: false },
            { n: "Engine Oil & Filter Change (Labour)", p: 499, d: "Draining old engine oil, changing oil filter & refilling.", popular: true },
            { n: "Air & Cabin AC Filter Replacement", p: 199, d: "Cleaning engine intake & AC dust filters.", popular: false },
            { n: "Coolant Top-up & Hose Check", p: 249, d: "Flushing radiator reservoir & topping up fluid.", popular: false },
            { n: "Clutch Cable Adjustment / Swap", p: 299, d: "Adjusting heavy clutch pedal feel.", popular: false },
            { n: "Spark Plug Cleaning & Gap Setting", p: 249, d: "Cleaning carbon buildup from spark plugs.", popular: false },
            { n: "Wiper Blade Replacement", p: 149, d: "Fitting new front/rear windshield wipers.", popular: false },
            { n: "Door Latch & Power Window Lubrication", p: 299, d: "Fixing sticky power windows or door latches.", popular: false },
            { n: "Other Car Mechanic Issue", p: 199, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "bike mech": {
        name: "Doorstep Bike Mechanic",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800",
        desc: "Carburetor cleaning, spark plug scaling, chain sprocket lubrication, and brake cable wiring.",
        icon: "fa-motorcycle",
        subs: [
            { n: "Bike General Inspection", p: 129, d: "Control cable, tyre pressure, and brake inspection.", popular: false, is_inspection: true },
            { n: "Full Periodic General Tuneup", p: 299, d: "Carburetor cleaning, spark plug tuning, brake adjustment & oil top-up.", popular: true },
            { n: "Engine Oil Change (Labour)", p: 99, d: "Draining old engine oil & refilling new fluid.", popular: false },
            { n: "Brake Shoe Replacement (Drum)", p: 149, d: "Front or rear drum brake shoe fitting.", popular: false },
            { n: "Disc Brake Pad Replacement", p: 229, d: "Bleeding brake line & replacing front disc pads.", popular: false },
            { n: "Spark Plug Replacement / Clean", p: 99, d: "Cleaning carbon & setting spark gap.", popular: false },
            { n: "Chain Clean, Adjust & Lube", p: 119, d: "Tightening loose chain & applying chain lube.", popular: true },
            { n: "Chain Sprocket Kit Replacement", p: 399, d: "Complete drivetrain gear assembly swap.", popular: false },
            { n: "Clutch / Accelerator Cable Replacement", p: 129, d: "Replacing snapped control cable.", popular: false },
            { n: "Battery Installation & Terminal Clean", p: 149, d: "Fitting new two-wheeler battery.", popular: false },
            { n: "Tubeless Tyre Puncture / Tube Replacement", p: 149, d: "On-site tyre repair.", popular: false },
            { n: "Horn / Indicator Wiring Fix", p: 179, d: "Fixing loose electrical switch connections.", popular: false },
            { n: "Other Bike Mechanic Issue", p: 149, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },

    // ==========================================
    // OTHER UTILITIES (Category: Other)
    // ==========================================
    "pest ctrl": {
        name: "Eco-Safe Pest Control",
        image: "https://images.unsplash.com/photo-1624969862644-791f3dc98927?auto=format&fit=crop&w=800",
        desc: "Herbal gel anti-termite shielding, bedbug eradication, and target rodent trapping layers.",
        icon: "fa-shield-virus",
        subs: [
            { n: "Infestation Survey Audit", p: 149, d: "Nesting site tracking & safe chemical selection.", popular: false, is_inspection: true },
            { n: "Cockroach Herbal Gel Infusion (1 BHK)", p: 499, d: "Odorless kitchen gel spot application.", popular: true },
            { n: "Cockroach Herbal Gel Infusion (2 BHK)", p: 699, d: "Odorless kitchen gel spot application for 2 BHK.", popular: false },
            { n: "Cockroach Herbal Gel Infusion (3 BHK)", p: 899, d: "Full home gel spot application for 3 BHK.", popular: false },
            { n: "Bed Bug Spray Treatment (2 Visits)", p: 799, d: "Two-phase intense chemical spray process for elimination.", popular: true },
            { n: "Anti-Termite Chemical Injection", p: 1599, d: "Drilling and baseboard chemical barrier injection.", popular: false },
            { n: "Mosquito / Fly Thermal Fogging", p: 599, d: "Outdoor patio & garden fogging treatment.", popular: false },
            { n: "Rodent Trapping & Baiting", p: 399, d: "Placing eco-friendly sticky traps and glue boards.", popular: false },
            { n: "Ants & Wood-Borer Chemical Spray", p: 499, d: "Targeted spray for wooden furniture & corners.", popular: false },
            { n: "Other Pest Control Issue", p: 149, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "grass cutting": {
        name: "Lawn Mowing & Gardening",
        image: "https://images.unsplash.com/photo-1534710961216-75c974029d75?auto=format&fit=crop&w=800",
        desc: "Weed evacuation, mechanical grass trimming, and decorative hedge shaping layers.",
        icon: "fa-seedling",
        subs: [
            { n: "Garden Area Survey & Estimate", p: 149, d: "Soil check & runtime planning.", popular: false, is_inspection: true },
            { n: "Mechanical Grass Mowing (< 500 Sq.Ft)", p: 399, d: "Trimming lawn using gas mower.", popular: true },
            { n: "Mechanical Grass Mowing (500-1000 Sq.Ft)", p: 699, d: "Trimming large lawn area.", popular: false },
            { n: "Hedge & Bush Ornamental Pruning", p: 299, d: "Shaping boundary plants & bushes.", popular: false },
            { n: "Tree Branch Trimming & Shaving", p: 399, d: "Cutting overgrown dangerous tree branches.", popular: false },
            { n: "Weed Extraction & Yard Clearance", p: 349, d: "Manual weed pulling & green waste collection.", popular: false },
            { n: "Soil Aeration & Manure Spread", p: 449, d: "Tilling soil & spreading organic fertilizer.", popular: false },
            { n: "Plant Potting & Repotting (Up to 5 Pots)", p: 299, d: "Soil replacement & repotting plants.", popular: false },
            { n: "Other Gardening Issue", p: 149, d: "Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    },
    "default": {
        name: "General Service", 
        image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800",
        desc: "Standard inspection and repair service. Quality guaranteed.",
        icon: "fa-tools",
        subs: [
            { n: "Standard Visit & Inspection", p: 199, d: "Standard doorstep assessment charge.", popular: false, is_inspection: true },
            { n: "Minor Quick Repair", p: 299, d: "Up to 1 hour simple work.", popular: true },
            { n: "Major Complex Repair", p: 599, d: "Complex technical or multi-hour work.", popular: false },
            { n: "Other Custom Requirement", p: 199, d: "Fee adjusted in final bill if work is approved.", is_inspection: true, popular: false }
        ]
    }
};

const SUPABASE_URL = 'https://kzxdxnxgouthsywbsnvl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eGR4bnhnb3V0aHN5d2JzbnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMzIsImV4cCI6MjA4MTg5MzMzMn0.nqzn89vmTFKVNuZPHfGRxdTg6UHT6GMud238rr49qag';

if (window.supabase) {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
