import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage6_4 {
    /*
    6.4 ->  6.6 : Room has >= 50 extensions
    6.4 <-  6.6 : Room has < 50 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) >= 50) {
            myRoom.roomStage = 6.6;
            ReportController.email("STAGE+ 6.6 " + LogHelper.roomNameAsLink(myRoom.name) + " 50 extensions");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 50) {
            myRoom.roomStage = 6.4;
            ReportController.email("STAGE- 6.4 " + LogHelper.roomNameAsLink(myRoom.name) + " 50 extensions");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 50);
    }
}
