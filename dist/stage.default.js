"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: class-name
class StageDefault {
    /*
    -1  ->  0   : Get a room controller that's mine
    -1  <-  0   : Have no room controller that's mine
    */
    static up(myRoom, room) {
        if (room.controller != null &&
            room.controller.my === true) {
            myRoom.roomStage = 0;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 0");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (room.controller == null ||
            room.controller.my === false) {
            myRoom.roomStage = -1;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage -1");
            return true;
        }
        return false;
    }
}
exports.StageDefault = StageDefault;
