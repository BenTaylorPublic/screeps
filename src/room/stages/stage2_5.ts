import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";

// tslint:disable-next-line: class-name
export class Stage2_5 {
    /*
    2.5 ->  2.8   : Room has >= 10 extensions
    2.5 <-  2.8   : Room has < 10 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) >= 10) {
            myRoom.roomStage = 2.8;
            ReportController.email("STAGE+ 2.8 " + LogHelper.roomNameAsLink(myRoom.name) + " 10 extensions");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
            myRoom.roomStage = 2.5;
            ReportController.email("STAGE- 2.5 " + LogHelper.roomNameAsLink(myRoom.name) + " 10 extensions");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 10);
    }
}
