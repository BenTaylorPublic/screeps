"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
// tslint:disable-next-line: class-name
class Stage2_6 {
    /*
    2.6 ->  3   : Room has >= 10 extensions
    2.6 <-  3   : Room has < 10 extensions
    */
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 10) {
            myRoom.roomStage = 3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.6");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        global_functions_1.GlobalFunctions.buildExtensions(myRoom, 10);
    }
}
exports.Stage2_6 = Stage2_6;
