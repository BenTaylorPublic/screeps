"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
// tslint:disable-next-line: class-name
class Stage0_5 {
    /*
    0.5 ->  1   : Room has >= 1 spawn
    0.5 <-  1   : Room has < 1 spawns
    */
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            //Spawn has been made
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            //Spawn has been made
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
