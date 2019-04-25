"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Stage4 {
    static up(myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 5) {
            myRoom.roomStage = 4.2;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.2");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 5) {
            myRoom.roomStage = 4;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4");
            return true;
        }
        return false;
    }
}
exports.Stage4 = Stage4;
