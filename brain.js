// brain.js
import { intents as staticIntents } from "./intents.js";
import { getResponse } from "./responses.js";
import { saveMessage, memory, saveDynamicIntents } from "./memory.js";
import { knowledge } from "./knowledge.js";  // for clarifications

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Merge static + dynamic intents
function getAllIntents() {
    // copy static intents
    let combined = staticIntents.map(i => ({ ...i, keywords: [...i.keywords] }));
    // add dynamic ones (or merge if same name)
    for (let dyn of memory.dynamicIntents) {
        let existing = combined.find(i => i.name === dyn.name);
        if (existing) {
            // merge keywords (avoid duplicates)
            for (let kw of dyn.keywords) {
                if (!existing.keywords.includes(kw)) existing.keywords.push(kw);
            }
        } else {
            combined.push({ name: dyn.name, keywords: [...dyn.keywords] });
        }
    }
    return combined;
}

function detectIntent(message, allIntents) {
    let text = message.toLowerCase();
    for (let intent of allIntents) {
        for (let word of intent.keywords) {
            if (text.includes(word)) {
                return intent.name;
            }
        }
    }
    return "unknown";
}

export function askAI(message) {
    saveMessage("user", message);

    // --- Context expansion ---
    // If message is short and we have a lastIntent, try to enrich
    let enrichedMessage = message;
    if (memory.lastIntent && message.split(" ").length <= 3) {
        // simple: prepend last intent to the message for matching
        // e.g., if last was "ac", and user says "it's noisy", we check "ac noisy"
        enrichedMessage = memory.lastIntent + " " + message;
    }

    // --- Check if we are in clarification flow ---
    if (memory.awaitingClarification) {
        // User is replying to our clarification question
        let reply = handleClarificationReply(message);
        saveMessage("ai", reply);
        memory.awaitingClarification = false;
        memory.originalMessage = null;
        return reply;
    }

    // --- Normal flow ---
    let allIntents = getAllIntents();
    let intent = detectIntent(enrichedMessage, allIntents);

    let reply;
    if (intent === "unknown") {
        // Ask for clarification
        memory.awaitingClarification = true;
        memory.originalMessage = message;   // store the original user message
        reply = getResponse("clarification");
        // Also store that we are in learning mode
        saveMessage("ai", reply);
        memory.lastIntent = null; // reset context until we know
        return reply;
    } else {
        // Normal response
        reply = getResponse(intent);
        memory.lastIntent = intent;
        saveMessage("ai", reply);
        return reply;
    }
}

// --- Handle the user's reply to clarification ---
function handleClarificationReply(userReply) {
    const lower = userReply.toLowerCase();
    // Map categories
    const categoryMap = {
        "ac": "ac",
        "air conditioner": "ac",
        "cooling": "ac",
        "plumbing": "plumber",
        "plumber": "plumber",
        "pipe": "plumber",
        "water": "plumber",
        "electrical": "electrician",
        "electrician": "electrician",
        "electric": "electrician",
        "wiring": "electrician",
        // Add more as needed
    };

    let foundCategory = null;
    for (let [key, value] of Object.entries(categoryMap)) {
        if (lower.includes(key)) {
            foundCategory = value;
            break;
        }
    }

    if (foundCategory) {
        // Add the original message as a keyword to this category
        const originalMsg = memory.originalMessage || "";
        // Check if we already have this dynamic intent for the category
        let dyn = memory.dynamicIntents.find(d => d.name === foundCategory);
        if (!dyn) {
            dyn = { name: foundCategory, keywords: [] };
            memory.dynamicIntents.push(dyn);
        }
        // Add the original message as a keyword (if not already present)
        if (!dyn.keywords.includes(originalMsg)) {
            dyn.keywords.push(originalMsg);
        }
        // Also add any other significant words from originalMsg (e.g., split by spaces)
        const words = originalMsg.split(/\s+/);
        for (let w of words) {
            if (w.length > 2 && !dyn.keywords.includes(w)) {
                dyn.keywords.push(w);
            }
        }
        // Save to localStorage
        saveDynamicIntents();

        // Now we can give a response from that category
        const reply = getResponse(foundCategory);
        // Also set last intent
        memory.lastIntent = foundCategory;
        return `Got it! I've learned that "${originalMsg}" relates to ${foundCategory}. ${reply}`;
    } else {
        // User didn't pick a category – we can ask again or use fallback
        return "I still didn't understand. You can say 'AC', 'plumbing', or 'electrical' to help me learn.";
    }
}
