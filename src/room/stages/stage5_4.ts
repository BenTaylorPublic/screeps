import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage5_4 {
    /*
    5.4 ->  5.6 : Room has >= 40 extensions
    5.4 <-  5.6 : Room has < 40 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) >= 40) {
            myRoom.roomStage = 5.6;
            ReportController.email("STAGE+ 5.6 " + LogHelper.roomNameAsLink(myRoom.name) + " 40 extensions");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 40) {
            myRoom.roomStage = 5.4;
            ReportController.email("STAGE- 5.4 " + LogHelper.roomNameAsLink(myRoom.name) + " 40 extensions");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 40);
    }
}
