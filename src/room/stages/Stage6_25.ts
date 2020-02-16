import {HelperFunctions} from "../../global/helper-functions";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage6_25 {
    /*
    6.25 ->  6.5 : Room has >= 3 tower
    6 <-  6.5 : Room has < 3 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_TOWER) >= 3) {
            myRoom.roomStage = 6.5;
            ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 6.5");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_TOWER) < 3) {
            myRoom.roomStage = 6.25;
            ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 6.25");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, 1);
    }
}
