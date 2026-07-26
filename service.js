
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
const servicesDB = {
    // ==========================================
    // HOME SERVICES (कॅटेगरी: Home_cat)
    // ==========================================
    "electrician": {
    name: "Expert Electrician",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800",
    desc: "Certified electricians for residential and commercial electrical installation, repairs and maintenance.",
    icon: "fa-bolt",
    subs: [

        // Inspection
        {
            n:"Electrical Inspection",
            p:199,
            d:"Complete inspection and fault diagnosis. Adjusted in final bill if work is approved.",
            duration:"20-30 min",
            warranty:"N/A",
            material:false,
            is_inspection:true,
            popular:true
        },

        {
            n:"Emergency Electrician Visit",
            p:299,
            d:"Urgent electrical inspection within service hours.",
            duration:"30 min",
            warranty:"N/A",
            material:false,
            is_inspection:true
        },

        // Switches

        {
            n:"Switch Replacement (1 Module)",
            p:149,
            d:"Replace faulty switch. Customer supplied material.",
            duration:"15 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Socket Replacement (5A)",
            p:179,
            d:"Replace standard socket.",
            duration:"15-20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Socket Replacement (15A)",
            p:249,
            d:"Heavy duty socket replacement.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Switchboard Repair",
            p:299,
            d:"Repair loose connections and faulty modules.",
            duration:"30-45 min",
            warranty:"30 Days",
            material:false,
            popular:true
        },

        {
            n:"Complete Switchboard Replacement",
            p:499,
            d:"Replace complete modular board.",
            duration:"45-60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Fan Regulator Replacement",
            p:199,
            d:"Replace old regulator.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Dimmer Installation",
            p:249,
            d:"Install light dimmer.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        // Fans

        {
            n:"Ceiling Fan Installation",
            p:399,
            d:"Install new ceiling fan.",
            duration:"40 min",
            warranty:"30 Days",
            material:false,
            popular:true
        },

        {
            n:"Ceiling Fan Replacement",
            p:349,
            d:"Replace existing fan.",
            duration:"30 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Ceiling Fan Repair",
            p:299,
            d:"Repair noisy or slow fan.",
            duration:"30-45 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Exhaust Fan Installation",
            p:349,
            d:"Install exhaust fan.",
            duration:"30 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Exhaust Fan Repair",
            p:249,
            d:"Repair exhaust fan.",
            duration:"30 min",
            warranty:"30 Days",
            material:false
        },

        // Lighting

        {
            n:"LED Bulb Installation",
            p:79,
            d:"Install customer supplied LED bulb.",
            duration:"10 min",
            warranty:"7 Days",
            material:false
        },

        {
            n:"Tube Light Installation",
            p:199,
            d:"Install LED tube light.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"LED Panel Light Installation",
            p:249,
            d:"Install ceiling panel light.",
            duration:"25 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Wall Light Installation",
            p:249,
            d:"Install decorative wall light.",
            duration:"25 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Chandelier Installation",
            p:999,
            d:"Install decorative chandelier.",
            duration:"90-120 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Decorative Light Installation",
            p:499,
            d:"Install decorative lighting.",
            duration:"45 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Outdoor Light Installation",
            p:299,
            d:"Install outdoor lighting.",
            duration:"30 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Garden Light Installation",
            p:349,
            d:"Install garden lights.",
            duration:"40 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Motion Sensor Light Installation",
            p:499,
            d:"Install motion sensor light.",
            duration:"45 min",
            warranty:"30 Days",
            material:false
        },

        // Wiring

        {
            n:"New 5A Electrical Point",
            p:499,
            d:"Labour only.",
            duration:"45-60 min",
            warranty:"30 Days",
            material:false,
            popular:true
        },

        {
            n:"New 15A Electrical Point",
            p:699,
            d:"Heavy load point.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Concealed Wiring Repair",
            p:599,
            d:"Minor concealed wiring repair.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Surface Wiring",
            p:449,
            d:"PVC casing wiring labour.",
            duration:"45 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Short Circuit Repair",
            p:699,
            d:"Locate and repair short circuit.",
            duration:"60-90 min",
            warranty:"30 Days",
            material:false,
            popular:true
        },

        {
            n:"House Rewiring",
            p:2499,
            d:"Labour charges only. Final quotation after inspection.",
            duration:"Variable",
            warranty:"90 Days",
            material:false
        },

        // MCB

        {
            n:"MCB Replacement",
            p:249,
            d:"Replace faulty MCB.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"MCB Tripping Repair",
            p:349,
            d:"Diagnose tripping issues.",
            duration:"40 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Distribution Board Repair",
            p:599,
            d:"Repair DB connections.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Distribution Board Installation",
            p:999,
            d:"Install customer supplied DB.",
            duration:"90 min",
            warranty:"30 Days",
            material:false
        },

        // Backup

        {
            n:"Inverter Installation",
            p:799,
            d:"Install inverter.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Battery Connection",
            p:249,
            d:"Connect inverter battery.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"UPS Installation",
            p:899,
            d:"Install UPS.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        // Appliances

        {
            n:"Door Bell Installation",
            p:199,
            d:"Install door bell.",
            duration:"20 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Geyser Electrical Connection",
            p:349,
            d:"Electrical connection only.",
            duration:"30 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"AC Power Point Installation",
            p:699,
            d:"Dedicated AC point.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Water Pump Wiring",
            p:449,
            d:"Motor wiring connection.",
            duration:"40 min",
            warranty:"30 Days",
            material:false
        },

        // Safety

        {
            n:"Earthing Check",
            p:399,
            d:"Check earthing resistance.",
            duration:"30 min",
            warranty:"N/A",
            material:false
        },

        {
            n:"Voltage Testing",
            p:249,
            d:"Check voltage fluctuations.",
            duration:"20 min",
            warranty:"N/A",
            material:false
        },

        {
            n:"Earth Leakage Check",
            p:349,
            d:"Leakage current inspection.",
            duration:"30 min",
            warranty:"N/A",
            material:false
        },

        // Commercial

        {
            n:"Office Electrical Repair",
            p:999,
            d:"Minor office electrical maintenance.",
            duration:"90 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Shop Electrical Repair",
            p:799,
            d:"Commercial electrical repairs.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        {
            n:"Meter Board Repair",
            p:699,
            d:"Repair meter board connections.",
            duration:"60 min",
            warranty:"30 Days",
            material:false
        },

        // Other

        {
            n:"Other Electrical Issue",
            p:199,
            d:"Can't find your problem? Inspection fee adjusted in final bill if work is approved.",
            duration:"20-30 min",
            warranty:"N/A",
            material:false,
            is_inspection:true,
            popular:true
        }

    ]
},
    "carpenter": { 
        name: "Expert Carpentry", 
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800",
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
    "cleaning": { 
        name: "Professional Cleaning", 
        image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800",
        desc: "Professional deep cleaning that goes beyond the daily broom. Restore absolute sanity and hygiene to your home instantly.",
        icon: "fa-broom",
        subs: [
            {n:"Full House Deep Clean", p:1999, d:"Intensive cleaning and dust elimination based on BHK size.", popular: true, has_options: true, type: 'house'},
            {n:"Bathroom Deep Disinfection", p:499, d:"Hard-water scale removal, tile scrubbing, and sanitization.", popular: false, has_options: true, type: 'bathroom'},
            {n:"Sofa Upholstery Spa", p:199, d:"Mechanized wet shampoo extraction wash per seat.", popular: false, has_options: true, type: 'sofa'},
            {n:"Kitchen Degreasing & Shine", p:999, d:"Oil stain removal from chimney mesh, backsplashes, and slabs.", popular: true},
            {n:"Water Tank Cleaning (Up to 1000L)", p:499, d:"High-pressure silt evacuation and eco-friendly antibacterial treatment.", popular: false}
        ]
    },
    "plumber": {
    name: "Expert Plumber",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800",
    desc: "Professional plumbing services for homes and commercial properties.",
    icon: "fa-faucet",

    subs: [

        // Inspection

        {
            id:"plumbing-inspection",
            slug:"plumbing-inspection",
            category:"plumber",
            subCategory:"inspection",

            n:"Plumbing Inspection",
            p:199,
            minPrice:199,
            maxPrice:199,
            priceType:"inspection",

            d:"Inspection and diagnosis of plumbing issues. Inspection charge adjusted if service is booked.",

            duration:"20-30 min",
            warranty:"N/A",
            materialIncluded:false,
            popular:true,
            inspection:true,
            skillLevel:"basic",

            tags:["Inspection","Leak","Diagnosis"]
        },

        {
            id:"emergency-plumber-visit",
            slug:"emergency-plumber-visit",
            category:"plumber",
            subCategory:"inspection",

            n:"Emergency Plumber Visit",
            p:299,
            minPrice:299,
            maxPrice:299,
            priceType:"inspection",

            d:"Urgent plumbing visit during working hours.",

            duration:"30 min",
            warranty:"N/A",
            materialIncluded:false,
            inspection:true,
            skillLevel:"basic",

            tags:["Emergency","Visit"]
        },

        // Taps

        {
            id:"tap-installation",
            slug:"tap-installation",
            category:"plumber",
            subCategory:"tap",

            n:"Tap Installation",
            p:249,
            minPrice:249,
            maxPrice:249,
            priceType:"fixed",

            d:"Installation of customer supplied tap.",

            duration:"20-30 min",
            warranty:"30 Days",
            materialIncluded:false,
            popular:true,
            inspection:false,
            skillLevel:"basic",

            tags:["Tap","Installation","Bathroom","Kitchen"]
        },

        {
            id:"tap-replacement",
            slug:"tap-replacement",

            category:"plumber",
            subCategory:"tap",

            n:"Tap Replacement",

            p:299,
            minPrice:299,
            maxPrice:299,

            priceType:"fixed",

            d:"Replace damaged or leaking tap.",

            duration:"20-30 min",

            warranty:"30 Days",

            materialIncluded:false,

            inspection:false,

            skillLevel:"basic",

            tags:["Tap","Replacement"]
        },

        {
            id:"tap-leak-repair",
            slug:"tap-leak-repair",

            category:"plumber",
            subCategory:"tap",

            n:"Tap Leakage Repair",

            p:249,
            minPrice:249,
            maxPrice:399,

            priceType:"starting",

            d:"Repair leaking tap.",

            duration:"20-40 min",

            warranty:"30 Days",

            materialIncluded:false,

            inspection:false,

            skillLevel:"basic",

            tags:["Tap","Leakage","Repair"]
        },

        {
            id:"mixer-tap-installation",
            slug:"mixer-tap-installation",

            category:"plumber",
            subCategory:"tap",

            n:"Mixer Tap Installation",

            p:399,
            minPrice:399,
            maxPrice:499,

            priceType:"starting",

            d:"Install mixer tap.",

            duration:"30-45 min",

            warranty:"30 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Mixer","Tap"]
        },

        // Basin

        {
            id:"wash-basin-installation",
            slug:"wash-basin-installation",

            category:"plumber",
            subCategory:"basin",

            n:"Wash Basin Installation",

            p:699,

            minPrice:699,

            maxPrice:999,

            priceType:"starting",

            d:"Install customer supplied wash basin.",

            duration:"60 min",

            warranty:"30 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Wash Basin","Installation"]
        },

        {
            id:"wash-basin-leakage",
            slug:"wash-basin-leakage",

            category:"plumber",

            subCategory:"basin",

            n:"Wash Basin Leakage Repair",

            p:349,

            minPrice:349,

            maxPrice:599,

            priceType:"starting",

            d:"Repair basin leakage.",

            duration:"30-45 min",

            warranty:"30 Days",

            materialIncluded:false,

            inspection:false,

            skillLevel:"basic",

            tags:["Wash Basin","Leak"]
        },

        // Toilet

        {
            id:"western-toilet-installation",
            slug:"western-toilet-installation",

            category:"plumber",

            subCategory:"toilet",

            n:"Western Toilet Installation",

            p:999,

            minPrice:999,

            maxPrice:1499,

            priceType:"starting",

            d:"Install customer supplied WC.",

            duration:"90 min",

            warranty:"30 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"advanced",

            tags:["Toilet","WC"]
        },

        {
            id:"toilet-blockage-removal",
            slug:"toilet-blockage-removal",

            category:"plumber",

            subCategory:"toilet",

            n:"Toilet Blockage Removal",

            p:499,

            minPrice:499,

            maxPrice:799,

            priceType:"starting",

            d:"Clear toilet blockage.",

            duration:"45-60 min",

            warranty:"15 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Toilet","Blockage"]
        },

        {
            id:"flush-tank-repair",
            slug:"flush-tank-repair",

            category:"plumber",

            subCategory:"flush",

            n:"Flush Tank Repair",

            p:349,

            minPrice:349,

            maxPrice:599,

            priceType:"starting",

            d:"Repair flush tank mechanism.",

            duration:"30-45 min",

            warranty:"30 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"basic",

            tags:["Flush","Repair"]
        },

        {
            id:"flush-tank-replacement",
            slug:"flush-tank-replacement",

            category:"plumber",

            subCategory:"flush",

            n:"Flush Tank Replacement",

            p:699,

            minPrice:699,

            maxPrice:999,

            priceType:"starting",

            d:"Replace flush tank.",

            duration:"60 min",

            warranty:"30 Days",

            materialIncluded:false,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Flush","Replacement"]
        },

        // Drain

        {
            id:"drain-blockage",
            slug:"drain-blockage",

            category:"plumber",

            subCategory:"drain",

            n:"Drain Blockage Removal",

            p:399,

            minPrice:399,

            maxPrice:699,

            priceType:"starting",

            d:"Clear floor drain blockage.",

            duration:"30-60 min",

            warranty:"15 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Drain","Blockage"]
        },

        {
            id:"kitchen-sink-blockage",
            slug:"kitchen-sink-blockage",

            category:"plumber",

            subCategory:"sink",

            n:"Kitchen Sink Blockage Removal",

            p:449,

            minPrice:449,

            maxPrice:699,

            priceType:"starting",

            d:"Remove sink blockage.",

            duration:"30-60 min",

            warranty:"15 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Kitchen","Sink"]
        },

        // Pipes

        {
            id:"pipe-leakage-repair",
            slug:"pipe-leakage-repair",

            category:"plumber",

            subCategory:"pipe",

            n:"Pipe Leakage Repair",

            p:399,

            minPrice:399,

            maxPrice:799,

            priceType:"starting",

            d:"Repair leaking water pipe.",

            duration:"45-60 min",

            warranty:"30 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"intermediate",

            tags:["Pipe","Leak"]
        },

        {
            id:"pipe-replacement",
            slug:"pipe-replacement",

            category:"plumber",

            subCategory:"pipe",

            n:"Pipe Replacement",

            p:699,

            minPrice:699,

            maxPrice:1999,

            priceType:"starting",

            d:"Replace damaged pipeline. Material extra.",

            duration:"1-3 hrs",

            warranty:"30 Days",

            materialIncluded:false,

            inspection:false,

            skillLevel:"advanced",

            tags:["Pipe","Replacement"]
        },

        // Pumps

        {
            id:"water-motor-installation",
            slug:"water-motor-installation",

            category:"plumber",

            subCategory:"motor",

            n:"Water Pump Installation",

            p:999,

            minPrice:999,

            maxPrice:1499,

            priceType:"starting",

            d:"Install domestic water pump.",

            duration:"90 min",

            warranty:"30 Days",

            materialIncluded:false,

            popular:true,

            inspection:false,

            skillLevel:"advanced",

            tags:["Pump","Motor"]
        },

        {
            id:"water-motor-repair",
            slug:"water-motor-repair",

            category:"plumber",

            subCategory:"motor",

            n:"Water Pump Repair",

            p:699,

            minPrice:699,

            maxPrice:1499,

            priceType:"starting",

            d:"Repair domestic water pump.",

            duration:"60-90 min",

            warranty:"30 Days",

            materialIncluded:false,

            inspection:false,

            skillLevel:"advanced",

            tags:["Pump","Repair"]
        }

    ]
},
    "painter": {
        name: "Premium Painting",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800",
        desc: "Interior wall textures, waterproof coats, and exterior emulsion painting done by experts.",
        icon: "fa-paint-roller",
        subs: [
            {n:"Wall Inspection & Scan", p:299, d:"Moisture check & wall measuring test", popular: false},
            {n:"Single Wall Texture Painting", p:2499, d:"Decorative pattern accent wall setup", popular: true},
            {n:"Waterproofing Coating", p:1499, d:"Anti-damp wall chemical treatment per wall", popular: false},
            {n:"Full Room Refresh Touchup", p:4999, d:"Quick minor scraping and single room color coat", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "mason": {
        name: "Expert Masonry Work",
        image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800",
        desc: "Bricklaying, wall plastering, tile replacements, and cement structural adjustments.",
        icon: "fa-trowel",
        subs: [
            {n:"Site Survey & Evaluation", p:299, d:"Architectural measurements & raw material estimation", popular: false},
            {n:"Tile Replacement & Patching", p:550, d:"Fixing broken bathroom or balcony floor pieces", popular: true},
            {n:"Wall Plastering (Minor area)", p:1200, d:"Cement plaster patching for scaling/cracked surface", popular: false},
            {n:"Concrete Crack Filling", p:850, d:"Structural ceiling or floor crack structural seal", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "welder": {
        name: "Metal Fabrication & Welding",
        image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800",
        desc: "Gate alignment, grill reinforcement, spot welding, and industrial-grade shield fabrication.",
        icon: "fa-screwdriver",
        subs: [
            {n:"Inspection & Structural Check", p:299, d:"Damage diagnostics & load check", popular: false},
            {n:"Gate Hinge Spot Welding", p:499, d:"Reinforcing dropping/loose heavy iron gates", popular: true},
            {n:"Window Grill Modification", p:850, d:"Cutting or joining security bars", popular: false},
            {n:"Shutter Channel Repair", p:1100, d:"Commercial storefront latch and roller adjustment", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },

    // ==========================================
    // APPLIANCE REPAIR (कॅटेगरी: Appliance)
    // ==========================================
    "ac tech": { 
        name: "AC Repair & Service", 
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800",
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
    "fridge": {
        name: "Refrigerator Expert",
        image: "https://images.unsplash.com/photo-1571175432247-5b86d4c3bda3?auto=format&fit=crop&w=800",
        desc: "Single door, double door, and side-by-side refrigerator compressor and sensor fixing.",
        icon: "fa-refrigerator",
        subs: [
            {n:"Refrigerator Inspection", p:299, d:"Compressor or cooling diagnostic loop check", popular: false},
            {n:"Gas Charging", p:1850, d:"Refrigerant top-up & capillary cleaning", popular: true},
            {n:"Thermostat Replacement", p:750, d:"Temperature control breakdown repair", popular: false},
            {n:"Relay/Capacitor Kit", p:650, d:"Fixing start-up humming noise issue", popular: false},
            {n:"Defrost Timer Module", p:950, d:"Solving ice accumulation anomalies", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "washing m.": {
        name: "Washing Machine Service",
        image: "https://images.unsplash.com/photo-1610557892470-55d9e80e0bce?auto=format&fit=crop&w=800",
        desc: "Top load and front load washer component fixes, drum balancing, and spin motor diagnostics.",
        icon: "fa-soap",
        subs: [
            {n:"Machine Diagnosis Check", p:299, d:"Washing machine hardware diagnostic cycle", popular: false},
            {n:"Drain Pump Replacement", p:850, d:"Resolving water logging/stuck water issues", popular: true},
            {n:"Inlet Valve Replacement", p:650, d:"Fixing slow or zero water intake errors", popular: false},
            {n:"Drum Suspension Alignment", p:1200, d:"Fixing high vibration/knocking during spin", popular: false},
            {n:"Gear Box Refurbishment", p:1850, d:"Fixing center agitator rotation lock", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "microwave": {
        name: "Microwave Oven Care",
        image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800",
        desc: "Magnetron replacement, high voltage transformer fixes, and touch pad interface repairs.",
        icon: "fa-dumpster-fire",
        subs: [
            {n:"Microwave Diagnostic Check", p:250, d:"Sparking or zero heating diagnostic loop", popular: false},
            {n:"Magnetron Replacement", p:1450, d:"Fixes system running but not heating food", popular: true},
            {n:"Turntable Motor Replacement", p:550, d:"Fixes internal glass plate rotation lock", popular: false},
            {n:"High-Voltage Fuse Swap", p:350, d:"Dead console power restoration", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "ro filter": {
        name: "Water Purifier & RO Care",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800",
        desc: "TDS profiling, filter element scaling clearance, sediment swaps, and booster pump repairs.",
        icon: "fa-faucet-drip",
        subs: [
            {n:"RO Diagnostic & TDS Test", p:199, d:"Water purity evaluation and filter efficiency check", popular: false},
            {n:"Complete Filter Cartridge Kit", p:1250, d:"Sediment + Carbon + RO Membrane comprehensive replacement", popular: true},
            {n:"RO Booster Pump Replacement", p:1950, d:"Restores raw input operational tracking pressure", popular: false},
            {n:"SV / SMPS Power Unit Fix", p:650, d:"Fixes auto shutoff or dead control loop switch", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },

    // ==========================================
    // ELECTRONICS (कॅटेगरी: Electronics)
    // ==========================================
    "tv / led": {
        name: "TV & LED Panel Repair",
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800",
        desc: "Wall mounting setup, backlight string restoration, and motherboard card replacement.",
        icon: "fa-tv",
        subs: [
            {n:"Panel Diagnosis & Scan", p:330, d:"Display glitch or sound test assessment", popular: false},
            {n:"Wall Mount Installation", p:399, d:"Heavy duty brackets setup (up to 43 inch)", popular: true},
            {n:"Motherboard Card Repair", p:1850, d:"Fixes port signal lock or looping power screen", popular: false},
            {n:"LED Backlight Replacement", p:2200, d:"Resolves sound present but no screen display issue", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "cctv": {
        name: "CCTV Security Systems",
        image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800",
        desc: "Camera mounting, coaxial channel wiring, DVR configuration, and remote app viewing sync.",
        icon: "fa-video",
        subs: [
            {n:"CCTV System Inspection", p:299, d:"Video loss or channel transmission test", popular: false},
            {n:"Single Camera Mounting", p:350, d:"BNC connection & structural adjustment per node", popular: true},
            {n:"DVR/NVR Hard Drive Setup", p:650, d:"Storage profiling & recording timeline settings", popular: false},
            {n:"Mobile Remote App Sync", p:450, d:"IP configuration for online live stream access", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },

    // ==========================================
    // AUTOMOTIVE (कॅटेगरी: Auto)
    // ==========================================
    "car mech": {
        name: "On-Demand Car Mechanic",
        image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800",
        desc: "Battery jumpstarts, brake shoe adjustments, engine oil flushes, and roadside diagnostics.",
        icon: "fa-car",
        subs: [
            {n:"Car OBD Scan & Inspection", p:499, d:"Computerized code scan & system health check", popular: false},
            {n:"Battery Jumpstart Emergency", p:399, d:"Heavy cable deployment to restore flat batteries", popular: true},
            {n:"Brake Pads Replacement", p:750, d:"Front disc pads removal and alignment setup", popular: false},
            {n:"Engine Oil Service Lab", p:999, d:"Oil filter replacement & mineral fluid replenishment", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "bike mech": {
        name: "Doorstep Bike Mechanic",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800",
        desc: "Carburetor cleaning, spark plug scaling, chain sprocket lubrication, and brake cable wiring.",
        icon: "fa-motorcycle",
        subs: [
            {n:"Bike General Inspection", p:199, d:"Chain slack, filter, and control cable check", popular: false},
            {n:"Full Periodic General Tuneup", p:450, d:"Carburetor tuning, plug cleaning, and comprehensive oil top-up", popular: true},
            {n:"Brake Shoe Replacement", p:250, d:"Front/Rear drum replacement for enhanced safety", popular: false},
            {n:"Chain Sprocket Kit Fit", p:650, d:"Complete drivetrain assembly replacement", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },

    // ==========================================
    // OTHER UTILITIES (कॅटेगरी: Other)
    // ==========================================
    "pest ctrl": {
        name: "Eco-Safe Pest Control",
        image: "https://images.unsplash.com/photo-1624969862644-791f3dc98927?auto=format&fit=crop&w=800",
        desc: "Herbal gel anti-termite shielding, bedbug eradication, and target rodent trapping layers.",
        icon: "fa-shield-virus",
        subs: [
            {n:"Infestation Survey Audit", p:199, d:"Nesting site tracking & chemical compound safe match", popular: false},
            {n:"Cockroach Herbal Gel Infusion", p:699, d:"Odorless modular kitchen gel spot application (1 BHK)", popular: true},
            {n:"Bed Bug Special Treatment", p:1100, d:"Two-phase intense chemical spray process for deep elimination", popular: false},
            {n:"Anti-Termite Chemical Shielding", p:2499, d:"Drilling and structural chemical injection across baseboards", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "grass cutting": {
        name: "Lawn Mowing & Gardening",
        image: "https://images.unsplash.com/photo-1534710961216-75c974029d75?auto=format&fit=crop&w=800",
        desc: "Weed evacuation, mechanical grass trimming, and decorative hedge shaping layers.",
        icon: "fa-seedling",
        subs: [
            {n:"Garden Area Survey & Estimate", p:199, d:"Soil check & machinery runtime planning", popular: false},
            {n:"Mechanical Grass Mowing", p:599, d:"Trimming up to 500 sq.ft lawn area using gas machines", popular: true},
            {n:"Hedge Pruning & Wire Shaping", p:450, d:"Boundary wall plants ornamental structure cut", popular: false},
            {n:"Soil Aeration & Manure Spread", p:750, d:"Organic nourishment infusion for plant beds", popular: false},
            {n:"Other Issue",p:299,d:"Can't find your problem? Expert inspection. Fee adjusted in final bill if work is approved.",is_inspection: true, popular: false}
        ]
    },
    "default": {
        name: "General Service", 
        image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&w=800",
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
