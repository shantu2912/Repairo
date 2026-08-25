import { knowledge } from "./knowledge.js";

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getResponse(intent) {
    switch (intent) {
        // General
        case "greeting": return random(knowledge.greeting);
        case "goodbye": return random(knowledge.goodbye);
        case "help": return random(knowledge.help);
        case "thanks": return random(knowledge.thanks);

        // AC
        case "ac_cooling": return random(knowledge.ac_cooling);
        case "ac_noise": return random(knowledge.ac_noise);
        case "ac_leak": return random(knowledge.ac_leak);
        case "ac_smell": return random(knowledge.ac_smell);
        case "ac_not_on": return random(knowledge.ac_not_on);

        // Plumber
        case "plumber_leak": return random(knowledge.plumber_leak);
        case "plumber_clog": return random(knowledge.plumber_clog);
        case "plumber_install": return random(knowledge.plumber_install);
        case "plumber_pressure": return random(knowledge.plumber_pressure);

        // Electrician
        case "electrician_short": return random(knowledge.electrician_short);
        case "electrician_switch": return random(knowledge.electrician_switch);
        case "electrician_fan": return random(knowledge.electrician_fan);
        case "electrician_wiring": return random(knowledge.electrician_wiring);

        // Business
        case "booking": return random(knowledge.booking);
        case "price_estimate": return random(knowledge.price_estimate);
        case "warranty": return random(knowledge.warranty);
        case "payment": return random(knowledge.payment);
        case "discount": return random(knowledge.discount);
        case "cancellation": return random(knowledge.cancellation);
        case "complaint": return random(knowledge.complaint);
        case "emergency": return random(knowledge.emergency);

        default: return random(knowledge.fallback);
    }
}
