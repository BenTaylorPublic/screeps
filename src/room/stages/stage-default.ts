import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";


export class StageDefault {
    /*
    -1  ->  0   : Get a room controller that's mine
    -1  <-  0   : Have no room controller that's mine
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.my === true) {
            myRoom.roomStage = 0;
            ReportController.email("STAGE+ 0 " + LogHelper.roomNameAsLink(myRoom.name) + " my controller");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.my === false) {
            myRoom.roomStage = -1;
            ReportController.email("STAGE- 0 " + LogHelper.roomNameAsLink(myRoom.name) + " my controller");
            return true;
        }
        return false;
    }
}
