import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";


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
            ReportController.email("STAGE+ 4.2 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL5");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 5) {
            myRoom.roomStage = 4;
            ReportController.email("STAGE- 4 " + LogHelper.roomNameAsLink(myRoom.name) + " RCL5");
            return true;
        }
        return false;
    }
}
