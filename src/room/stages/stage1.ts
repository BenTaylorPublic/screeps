import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";


// tslint:disable-next-line: class-name
export class Stage1 {
    /*
    1   ->  1.5 : RCL is level >= 2
    1   <-  1.5 : RCL is level < 2
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 2) {
            myRoom.roomStage = 1.5;
            ReportController.email("STAGE+ 1.5 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL2");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 2) {
            myRoom.roomStage = 1;
            ReportController.email("STAGE- 1 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL2");
            return true;
        }
        return false;
    }
}
