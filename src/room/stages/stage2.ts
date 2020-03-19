import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";

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
            ReportController.email("STAGE+ 2.3 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL3");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 3) {
            myRoom.roomStage = 2;
            ReportController.email("STAGE- 2 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL3");
            return true;
        }
        return false;
    }
}
