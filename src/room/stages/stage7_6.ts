import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";
import {StageFunctions} from "./stage-functions";

// tslint:disable-next-line: class-name
export class Stage7_6 {
    /*
    7.6 ->  7.7   : Room has >= 3 spawn
    7.6 <-  7.7   : Room has < 3 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) >= 3) {
            //Spawn has been made
            myRoom.roomStage = 7.7;
            ReportController.email("STAGE+ 7.7 " + LogHelper.roomNameAsLink(myRoom.name) + " 3 spawns");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) < 3) {
            //Spawn has been made
            myRoom.roomStage = 7.6;
            ReportController.email("STAGE- 7.6 " + LogHelper.roomNameAsLink(myRoom.name) + " 3 spawns");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildSpawns(myRoom, room, 3);
    }
}
