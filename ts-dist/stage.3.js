"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Stage3 {
    static up(myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 4) {
            myRoom.roomStage = 3.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3.3");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 4) {
            myRoom.roomStage = 3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3");
            return true;
        }
        return false;
    }
}
exports.Stage3 = Stage3;
