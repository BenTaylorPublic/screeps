"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage1_3 = {
    /*
    1.3 ->  1.6 : Room has >= 5 extensions
    1.3 <-  1.6 : Room has < 5 extensions
    */
    up: function (myRoom, room) {
        exports.stage1_3.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 5) {
            myRoom.roomStage = 1.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1.6");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 5) {
            myRoom.roomStage = 1.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.3");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        global_functions_1.GlobalFunctions.buildExtensions(myRoom, 5);
    }
};
