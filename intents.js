export const intents = [
    // General
    { name: "greeting", keywords: ["hi", "hello", "hey", "good morning", "good evening", "howdy", "yo", "sup"] },
    { name: "goodbye", keywords: ["goodbye", "bye", "see you", "farewell", "take care", "later", "cya"] },
    { name: "help", keywords: ["help", "support", "guide", "assist", "what can you do", "how to", "options"] },
    { name: "thanks", keywords: ["thanks", "thank you", "thx", "ty", "appreciate it"] },

    // AC Sub-intents
    { name: "ac_cooling", keywords: ["ac not cooling", "cooling issue", "warm air", "not cold", "cooling problem", "blower"] },
    { name: "ac_noise", keywords: ["noise", "sound", "grinding", "squealing", "rattling", "clicking", "buzzing"] },
    { name: "ac_leak", keywords: ["water leak", "drip", "leaking", "drain pan", "condensation", "water dripping"] },
    { name: "ac_smell", keywords: ["smell", "odor", "musty", "burning smell", "foul smell", "stale"] },
    { name: "ac_not_on", keywords: ["not turning on", "won't start", "dead", "no power", "won't switch on", "ac off"] },

    // Plumber Sub-intents
    { name: "plumber_leak", keywords: ["leak", "drip", "pipe burst", "water stain", "dripping", "faucet leak"] },
    { name: "plumber_clog", keywords: ["clog", "block", "drain", "stuck", "slow drain", "blocked pipe", "auger"] },
    { name: "plumber_install", keywords: ["install", "new tap", "new sink", "renovation", "fitting", "setup"] },
    { name: "plumber_pressure", keywords: ["pressure", "low water", "weak flow", "water pressure", "booster"] },

    // Electrician Sub-intents
    { name: "electrician_short", keywords: ["short", "circuit", "trip", "tripping", "spark", "fuse", "breaker"] },
    { name: "electrician_switch", keywords: ["switch", "outlet", "socket", "plug", "switchboard"] },
    { name: "electrician_fan", keywords: ["fan", "ceiling fan", "exhaust fan", "wobble", "pull chain"] },
    { name: "electrician_wiring", keywords: ["rewire", "wiring", "old wiring", "copper", "aluminum", "cable"] },

    // Business / Operations
    { name: "booking", keywords: ["book", "schedule", "appointment", "technician", "visit", "repair", "fix it", "come to my house"] },
    { name: "price_estimate", keywords: ["price", "cost", "charge", "rate", "estimate", "quote", "how much", "pay"] },
    { name: "warranty", keywords: ["warranty", "guarantee", "cover", "protection", "claim"] },
    { name: "payment", keywords: ["payment", "bill", "invoice", "pay", "credit card", "upi", "cash"] },
    { name: "discount", keywords: ["discount", "offer", "deal", "coupon", "promo", "sale", "cheap"] },
    { name: "cancellation", keywords: ["cancel", "reschedule", "change", "move", "delay", "postpone"] },
    { name: "complaint", keywords: ["complaint", "issue", "bad", "unhappy", "poor", "terrible", "unsatisfied", "fail", "wrong"] },
    { name: "emergency", keywords: ["emergency", "urgent", "now", "hurry", "immediate", "flood", "fire", "danger"] }
];
