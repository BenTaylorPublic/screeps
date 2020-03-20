import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage7_4 {
    /*
    7.4 ->  7.6 : Room has == 60 extensions
    7.4 <-  7.6 : Room has < 60 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) === 60) {
            myRoom.roomStage = 7.6;
            ReportController.email("STAGE+ 7.6 " + LogHelper.roomNameAsLink(myRoom.name) + " 60 extensions");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 60) {
            myRoom.roomStage = 7.4;
            ReportController.email("STAGE- 7.4 " + LogHelper.roomNameAsLink(myRoom.name) + " 60 extensions");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 60);
    }
}
