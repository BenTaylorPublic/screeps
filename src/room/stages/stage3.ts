import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helper-functions";

// tslint:disable-next-line: class-name
export class Stage3 {
    /*
    3   ->  3.3 : RCL is level >= 4
    3   <-  3.3 : RCL is level < 4
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 4) {
            myRoom.roomStage = 3.3;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 3.3");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 4) {
            myRoom.roomStage = 3;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 3");
            return true;
        }
        return false;
    }
}
