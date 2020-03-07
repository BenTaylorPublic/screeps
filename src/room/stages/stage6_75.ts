import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {StageFunctions} from "./stage-functions";

// tslint:disable-next-line: class-name
export class Stage6_75 {
    /*
    6.75 ->  7   : Room has >= 2 spawn
    6.75 <-  7   : Room has < 2 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 2) {
            //Spawn has been made
            myRoom.roomStage = 7;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 7");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) < 2) {
            //Spawn has been made
            myRoom.roomStage = 6.75;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 6.75");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildSpawns(myRoom, room, 2);
    }
}
