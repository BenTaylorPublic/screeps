"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stage3 = {
    /*
    3   ->  3.3 : RCL is level >= 4
    3   <-  3.3 : RCL is level < 4
    */
    up: function (myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 4) {
            myRoom.roomStage = 3.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3.3");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 4) {
            myRoom.roomStage = 3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        //No steps
    }
};
