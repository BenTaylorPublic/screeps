import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";

// tslint:disable-next-line: class-name
export class Stage2_6 {
    /*
    2.6 ->  3   : Room has >= 10 extensions
    2.6 <-  3   : Room has < 10 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) >= 10) {
            myRoom.roomStage = 3;
            ReportController.email("STAGE+ 3 " + LogHelper.roomNameAsLink(myRoom.name) + " 10 extensions");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
            myRoom.roomStage = 2.6;
            ReportController.email("STAGE- 2.6 " + LogHelper.roomNameAsLink(myRoom.name) + " 10 extensions");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 10);
    }
}
