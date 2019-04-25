"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class Stage0_5 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            myRoom.roomStage = 0.5;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.5");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        console.log("ATTENTION: Room " + room.name + " needs first spawn");
    }
}
exports.Stage0_5 = Stage0_5;
