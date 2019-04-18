"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage0_3 = {
    /*
    0.3 ->  0.6   : Room has >= 1 spawn
    0.3 <-  0.6   : Room has < 1 spawns
    */
    up: function (myRoom, room) {
        if (global_functions_1.globalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            //Spawn has been made
            myRoom.roomStage = 0.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 0.6");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.globalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            //Spawn has been made
            myRoom.roomStage = 0.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.3");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        console.log("ATTENTION: Room " + room.name + " needs first spawn");
    }
};
