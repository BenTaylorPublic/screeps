"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
// tslint:disable-next-line: class-name
class Stage4_4 {
    /*
    4.4 ->  4.6   : Room has >= 30 extensions
    4.4 <-  4.6   : Room has < 30 extensions
    */
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 30) {
            myRoom.roomStage = 4.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.6");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 30) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.4");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        global_functions_1.GlobalFunctions.buildExtensions(myRoom, 30);
    }
}
exports.Stage4_4 = Stage4_4;
