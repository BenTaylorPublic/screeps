"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage4_2 = {
    /*
    4.2 ->  4.4 : Room has >= 2 tower
    4.2 <-  4.4 : Room has < 2 tower
    */
    up: function (myRoom, room) {
        exports.stage4_2.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 2) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.4");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 2) {
            myRoom.roomStage = 4.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.2");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        global_functions_1.GlobalFunctions.buildTowers(myRoom, 2);
    }
};
