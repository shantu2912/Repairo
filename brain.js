import { intents } from "./intents.js";
import { getResponse } from "./responses.js";
import { saveMessage } from "./memory.js";


function detectIntent(message) {

    let text = message.toLowerCase();

    for (let intent of intents) {
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

    let intent = detectIntent(message);

    let reply = generateReply(intent);

    saveMessage("ai", reply);

    return reply;
}
