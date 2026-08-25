// memory.js
export const memory = {
    customerName: "",
    currentIntent: "",
    currentTopic: "",
    history: [],
    // New fields for learning
    dynamicIntents: [],      // [{ name: "ac", keywords: ["new word"] }]
    lastIntent: null,
    awaitingClarification: false,
    originalMessage: null
};

export function saveMessage(role, text) {
    memory.history.push({
        role,
        text,
        time: new Date().toLocaleTimeString()
    });
}

// Optional: load/save to localStorage
export function loadDynamicIntents() {
    const stored = localStorage.getItem("fixzenix_dynamic_intents");
    if (stored) {
        memory.dynamicIntents = JSON.parse(stored);
    }
}
export function saveDynamicIntents() {
    localStorage.setItem("fixzenix_dynamic_intents", JSON.stringify(memory.dynamicIntents));
}
