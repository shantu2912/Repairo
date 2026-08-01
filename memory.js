// Stores conversation information

export const memory = {
    customerName: "",
    currentIntent: "",
    currentTopic: "",
    history: []
};

export function saveMessage(role, text) {
    memory.history.push({
        role,
        text,
        time: new Date().toLocaleTimeString()
    });
}
