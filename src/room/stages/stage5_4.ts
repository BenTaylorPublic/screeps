import {HelperFunctions} from "../../global/helper-functions";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage5_4 {
    /*
    5.4 ->  5.6 : Room has >= 40 extensions
    5.4 <-  5.6 : Room has < 40 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_EXTENSION) >= 40) {
            myRoom.roomStage = 5.6;
            ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 5.6");
            return true;
        }
        this.step(myRoom, room);
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_EXTENSION) < 40) {
            myRoom.roomStage = 5.4;
            ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 5.4");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, 40);
    }
}
