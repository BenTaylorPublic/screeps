"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stage2 = {
    /*
    2   ->  2.3 : RCL is level >= 3
    2   <-  2.3 : RCL is level < 3
    */
    up: function (myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 3) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.3");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 3) {
            myRoom.roomStage = 2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        //No steps
    }
};
