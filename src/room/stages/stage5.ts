import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helper-functions";

// tslint:disable-next-line: class-name
export class Stage5 {
    /*
    5   ->  5.2 : RCL is level >= 6
    5   <-  5.2 : RCL is level < 6
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 6) {
            myRoom.roomStage = 5.2;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 5.2");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 6) {
            myRoom.roomStage = 5;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 5");
            return true;
        }
        return false;
    }
}
