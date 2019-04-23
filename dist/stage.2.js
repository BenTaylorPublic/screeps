"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: class-name
class Stage2 {
    /*
    2   ->  2.3 : RCL is level >= 3
    2   <-  2.3 : RCL is level < 3
    */
    static up(myRoom, room) {
        if (room.controller != null &&
            room.controller.level >= 3) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.3");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (room.controller == null ||
            room.controller.level < 3) {
            myRoom.roomStage = 2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2");
            return true;
        }
        return false;
    }
}
exports.Stage2 = Stage2;
