"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage2_6 = {
    /*
    2.6 ->  3   : Room has >= 10 extensions
    2.6 <-  3   : Room has < 10 extensions
    */
    up: function (myRoom, room) {
        exports.stage2_6.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 10) {
            myRoom.roomStage = 3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.6");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        global_functions_1.GlobalFunctions.buildExtensions(myRoom, 10);
    }
};
