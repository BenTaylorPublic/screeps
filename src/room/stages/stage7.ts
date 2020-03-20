import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";


export class Stage7 {
    /*
    7   ->  7.2 : RCL is level >= 8
    7   <-  7.2 : RCL is level < 8
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level === 8) {
            myRoom.roomStage = 7.2;
            ReportController.email("STAGE+ 7.2 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL8");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 8) {
            myRoom.roomStage = 7;
            ReportController.email("STAGE- 7 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL8");
            return true;
        }
        return false;
    }
}
