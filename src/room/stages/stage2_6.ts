
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

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
            ReportController.email("STAGE+: Room " + LogHelper.roomNameAsLink(myRoom.name) + " increased to room stage 3");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
            myRoom.roomStage = 2.6;
            ReportController.email("STAGE-: Room " + LogHelper.roomNameAsLink(myRoom.name) + " decreased to room stage 2.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 10);
    }
}
