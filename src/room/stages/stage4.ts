import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helpers/helper-functions";

// tslint:disable-next-line: class-name
export class Stage4 {
    /*
    4   ->  4.2 : RCL is level >= 5
    4   <-  4.2 : RCL is level < 5
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 5) {
            myRoom.roomStage = 4.2;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 4.2");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 5) {
            myRoom.roomStage = 4;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 4");
            return true;
        }
        return false;
    }
}
