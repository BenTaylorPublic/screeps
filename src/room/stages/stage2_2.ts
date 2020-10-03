import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";

// tslint:disable-next-line: class-name
export class Stage2_2 {
    /*
    2.2 ->  2.5 : Room has >= 1 tower
    2.2 <-  2.5 : Room has < 1 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) >= 1) {
            myRoom.roomStage = 2.5;
            ReportController.email("STAGE+ 2.5 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 tower");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) < 1) {
            myRoom.roomStage = 2.2;
            ReportController.email("STAGE- 2.2 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 tower");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, room, 1);
    }
}
