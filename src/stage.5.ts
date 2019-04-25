// tslint:disable-next-line: class-name
export class Stage5 {
    /*
    5   ->  5.1 : RCL is level >= 6
    5   <-  5.1 : RCL is level < 6
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 6) {
            myRoom.roomStage = 5.1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.1");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 6) {
            myRoom.roomStage = 5;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5");
            return true;
        }
        return false;
    }
}
