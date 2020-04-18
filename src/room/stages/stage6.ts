import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";


export class Stage6 {
    /*
    6   ->  6.2 : RCL is level >= 7
    6   <-  6.2 : RCL is level < 7
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 7) {
            myRoom.roomStage = 6.2;
            ReportController.email("STAGE+ 6.2 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL7");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 7) {
            myRoom.roomStage = 0;
            ReportController.email("STAGE- 6 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL7");
            return true;
        }
        return false;
    }
}
