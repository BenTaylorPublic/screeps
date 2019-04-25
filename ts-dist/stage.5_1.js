"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
const stage_functions_1 = require("./stage.functions");
class Stage5_1 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_LINK) >= 3) {
            myRoom.roomStage = 5.2;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.2");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_LINK) < 3) {
            myRoom.roomStage = 5.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5.2");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        stage_functions_1.StageFunctions.setupSourceLink(myRoom);
    }
}
exports.Stage5_1 = Stage5_1;
