// tslint:disable-next-line: class-name
export class Stage2 {
    /*
    2   ->  2.3 : RCL is level >= 3
    2   <-  2.3 : RCL is level < 3
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 3) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.3");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 3) {
            myRoom.roomStage = 2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2");
            return true;
        }
        return false;
    }
}
