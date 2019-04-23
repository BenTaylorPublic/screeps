"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage4_4 = {
    /*
    4.4 ->  4.6   : Room has >= 30 extensions
    4.4 <-  4.6   : Room has < 30 extensions
    */
    up: function (myRoom, room) {
        exports.stage4_4.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 30) {
            myRoom.roomStage = 4.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.6");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 30) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.4");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        global_functions_1.GlobalFunctions.buildExtensions(myRoom, 30);
    }
};
