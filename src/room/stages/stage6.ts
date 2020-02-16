import {ReportController} from "../../reporting/report-controller";

export class Stage6 {
    /*
    6   ->  6.25 : RCL is level >= 7
    6   <-  6.25 : RCL is level < 7
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 7) {
            myRoom.roomStage = 6.25;
            ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 6.25");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 7) {
            myRoom.roomStage = 0;
            ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 6");
            return true;
        }
        return false;
    }
}
