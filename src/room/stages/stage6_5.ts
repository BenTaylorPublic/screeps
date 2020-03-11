
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage6_5 {
    /*
    6.5 ->  6.75 : Room has >= 50 extensions
    6.5 <-  6.75 : Room has < 50 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) >= 50) {
            myRoom.roomStage = 6.75;
            ReportController.email("STAGE+: Room " + LogHelper.roomNameAsLink(myRoom.name) + " increased to room stage 6.75");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < 50) {
            myRoom.roomStage = 6.5;
            ReportController.email("STAGE-: Room " + LogHelper.roomNameAsLink(myRoom.name) + " decreased to room stage 6.5");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, room, 50);
    }
}
