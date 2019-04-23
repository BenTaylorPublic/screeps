"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
// tslint:disable-next-line: class-name
class Stage3_3 {
    /*
    3.3 ->  3.6 : Room has >= 20 extensions
    3.3 <-  3.6 : Room has < 20 extensions
    */
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 20) {
            myRoom.roomStage = 3.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3.6");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 20) {
            myRoom.roomStage = 3.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3.3");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        global_functions_1.GlobalFunctions.buildExtensions(myRoom, 20);
    }
}
exports.Stage3_3 = Stage3_3;
