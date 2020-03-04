import { HelperFunctions } from "../../global/helper-functions";
import { StageFunctions } from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage4_4 {
    /*
    4.4 ->  4.6   : Room has >= 30 extensions
    4.4 <-  4.6   : Room has < 30 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 30) {
            myRoom.roomStage = 4.6;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 4.6");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 30) {
            myRoom.roomStage = 4.4;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 4.4");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, 30);
    }
}
