import {ReportController} from "../../reporting/report-controller";


// tslint:disable-next-line: class-name
export class Stage0 {
    /*
    0   ->  0.5 : RCL is level >= 1
    0   <-  0.5 : RCL is level < 1
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 1) {
            myRoom.roomStage = 0.5;
            ReportController.email("STAGE+: Room " + LogHelper.roomNameAsLink(myRoom.name) + " increased to room stage 0.5");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 1) {
            myRoom.roomStage = 0;
            ReportController.email("STAGE-: Room " + LogHelper.roomNameAsLink(myRoom.name) + " decreased to room stage 0");
            return true;
        }
        return false;
    }
}
