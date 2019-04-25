"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Stage5 {
    static up(myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 6) {
            myRoom.roomStage = 5.1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.1");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 6) {
            myRoom.roomStage = 5;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5");
            return true;
        }
        return false;
    }
}
exports.Stage5 = Stage5;
