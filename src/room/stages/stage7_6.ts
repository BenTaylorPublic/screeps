import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {StageFunctions} from "./stage-functions";

// tslint:disable-next-line: class-name
export class Stage7_6 {
    /*
    7.6 ->  7.8   : Room has >= 3 spawn
    7.6 <-  7.8   : Room has < 3 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 3) {
            //Spawn has been made
            myRoom.roomStage = 7.8;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 7.8");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) < 3) {
            //Spawn has been made
            myRoom.roomStage = 7.6;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 7.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildSpawns(myRoom, room, 3);
    }
}
