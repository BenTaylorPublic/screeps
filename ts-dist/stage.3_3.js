"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
const stage_functions_1 = require("./stage.functions");
class Stage3_3 {
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
        stage_functions_1.StageFunctions.buildExtensions(myRoom, 20);
    }
}
exports.Stage3_3 = Stage3_3;
