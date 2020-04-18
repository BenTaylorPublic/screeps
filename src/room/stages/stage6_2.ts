import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage6_2 {
    /*
    6.2 -> 6.4 : Room has >= 3 tower
    6.2 <- 6.4 : Room has < 3 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) >= 3) {
            myRoom.roomStage = 6.4;
            ReportController.email("STAGE+6.4 " + LogHelper.roomNameAsLink(myRoom.name) + " 3 towers");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) < 3) {
            myRoom.roomStage = 6.2;
            ReportController.email("STAGE- 6.2 " + LogHelper.roomNameAsLink(myRoom.name) + " 3 towers");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, room, 3);
    }
}
