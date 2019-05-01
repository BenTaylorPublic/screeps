// tslint:disable-next-line: class-name
export class Stage1 {
    /*
    1   ->  1.3 : RCL is level >= 2
    1   <-  1.3 : RCL is level < 2
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 2) {
            myRoom.roomStage = 1.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1.3");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 2) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1");
            return true;
        }
        return false;
    }
}
