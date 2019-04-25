"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Stage1 {
    static up(myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 2) {
            myRoom.roomStage = 1.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1.3");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 2) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1");
            return true;
        }
        return false;
    }
}
exports.Stage1 = Stage1;
