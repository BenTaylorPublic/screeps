"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage2_3 = {
    /*
    2.3 ->  2.6 : Room has >= 1 tower
    2.3 <-  2.6 : Room has < 1 tower
    */
    up: function (myRoom, room) {
        exports.stage2_3.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 1) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.6");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 1) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.3");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        global_functions_1.GlobalFunctions.buildTowers(myRoom, 1);
    }
};
