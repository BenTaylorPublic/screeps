"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
const stage_functions_1 = require("./stage.functions");
class Stage4_2 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 2) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.4");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 2) {
            myRoom.roomStage = 4.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.2");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        stage_functions_1.StageFunctions.buildTowers(myRoom, 2);
    }
}
exports.Stage4_2 = Stage4_2;
