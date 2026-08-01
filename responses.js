import { knowledge } from "./knowledge.js";

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateReply(intent) {

    switch(intent){

        case "greeting":
            return random(knowledge.greeting);

        case "ac":
            return random(knowledge.ac);

        case "plumber":
            return random(knowledge.plumber);

        case "electrician":
            return random(knowledge.electrician);

        case "thanks":
            return random(knowledge.thanks);

        default:
            return random(knowledge.fallback);

    }

}
