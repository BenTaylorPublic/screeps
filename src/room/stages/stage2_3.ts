import {HelperFunctions} from "../../global/helper-functions";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage2_3 {
    /*
    2.3 ->  2.6 : Room has >= 1 tower
    2.3 <-  2.6 : Room has < 1 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 1) {
            myRoom.roomStage = 2.6;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 2.6");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 1) {
            myRoom.roomStage = 2.3;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 2.3");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, room, 1);
    }
}
