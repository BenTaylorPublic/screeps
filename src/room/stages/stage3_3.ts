import {HelperFunctions} from "../../global/helper-functions";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage3_3 {
    /*
    3.3 ->  3.6 : Room has >= 20 extensions
    3.3 <-  3.6 : Room has < 20 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_EXTENSION) >= 20) {
            myRoom.roomStage = 3.6;
            ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 3.6");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_EXTENSION) < 20) {
            myRoom.roomStage = 3.3;
            ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 3.3");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, 20);
    }
}
