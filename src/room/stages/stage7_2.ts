import {HelperFunctions} from "../../global/helper-functions";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage7_2 {
    /*
    7.2 ->  7.4 : Room has == 6 tower
    7.2 <-  7.4 : Room has < 6 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_TOWER) === 6) {
            myRoom.roomStage = 7.4;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 7.4");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 6) {
            myRoom.roomStage = 7.2;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 7.2");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, 6);
    }
}
