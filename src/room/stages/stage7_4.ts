import {HelperFunctions} from "../../global/helper-functions";
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
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) === 60) {
            myRoom.roomStage = 7.6;
            ReportController.log("STAGE", "Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 7.6");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 60) {
            myRoom.roomStage = 7.4;
            ReportController.log("STAGE", "Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 7.4");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, 60);
    }
}
