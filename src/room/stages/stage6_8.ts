import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";
import {StageFunctions} from "./stage-functions";

// tslint:disable-next-line: class-name
export class Stage6_8 {
    /*
    6.8 ->  7   : Room has >= 2 spawn
    6.8 <-  7   : Room has < 2 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) >= 2) {
            //Spawn has been made
            myRoom.roomStage = 7;
            ReportController.email("STAGE+ 7 " + LogHelper.roomNameAsLink(myRoom.name) + " 2 spawns");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) < 2) {
            //Spawn has been made
            myRoom.roomStage = 6.8;
            ReportController.email("STAGE- 6.8 " + LogHelper.roomNameAsLink(myRoom.name) + " 2 spawns");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildSpawns(myRoom, room, 2);
    }
}
