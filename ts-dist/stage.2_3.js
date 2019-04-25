"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
const stage_functions_1 = require("./stage.functions");
class Stage2_3 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 1) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.6");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 1) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.3");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        stage_functions_1.StageFunctions.buildTowers(myRoom, 1);
    }
}
exports.Stage2_3 = Stage2_3;
