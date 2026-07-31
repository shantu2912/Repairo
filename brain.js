import { intents } from "./intents.js";
import { getResponse } from "./responses.js";
import { addMessage } from "./memory.js";

function detectIntent(message){

    const text = message.toLowerCase();

    for(const intent of intents){

        for(const keyword of intent.keywords){

            if(text.includes(keyword)){

                return intent.name;

            }

        }

    }

    return "unknown";

}

export function talk(message){

    addMessage("user", message);

    const intent = detectIntent(message);

    const reply = getResponse(intent);

    addMessage("assistant", reply);

    return reply;

}