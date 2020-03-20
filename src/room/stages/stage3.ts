import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";


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
            ReportController.email("STAGE+ 3.3 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL4");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 4) {
            myRoom.roomStage = 3;
            ReportController.email("STAGE- 3 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL4");
            return true;
        }
        return false;
    }
}
