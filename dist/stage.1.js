"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: class-name
class Stage1 {
    /*
    1   ->  1.3 : RCL is level >= 2
    1   <-  1.3 : RCL is level < 2
    */
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
