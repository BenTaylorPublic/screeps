import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";
import {RoomHelper} from "../../global/helpers/room-helper";

// tslint:disable-next-line: class-name
export class Stage1_5 {
    /*
    1.5 ->  2 : Room has >= 5 extensions
    1.5 <-  2 : Room has < 5 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) >= 5) {
            myRoom.roomStage = 2;
            ReportController.email("STAGE+ 2 " + LogHelper.roomNameAsLink(myRoom.name) + " 5 extensions");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 5) {
            myRoom.roomStage = 1.5;
            ReportController.email("STAGE- 1.5 " + LogHelper.roomNameAsLink(myRoom.name) + " 5 extensions");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 5);
    }
}
