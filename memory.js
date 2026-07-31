// Stores conversation information

export const memory = {
    customerName: "",
    currentIntent: "",
    currentTopic: "",
    history: []
};

export function addMessage(role, text) {
    memory.history.push({
        role,
        text,
        time: new Date().toLocaleTimeString()
    });
}