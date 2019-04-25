"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
const stage_functions_1 = require("./stage.functions");
class Stage5_2 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 40) {
            myRoom.roomStage = 5.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.3");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 40) {
            myRoom.roomStage = 5.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5.2");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        stage_functions_1.StageFunctions.buildExtensions(myRoom, 40);
    }
}
exports.Stage5_2 = Stage5_2;
