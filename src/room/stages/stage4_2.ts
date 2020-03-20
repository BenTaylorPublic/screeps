import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage4_2 {
    /*
    4.2 ->  4.4 : Room has >= 2 tower
    4.2 <-  4.4 : Room has < 2 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) >= 2) {
            myRoom.roomStage = 4.4;
            ReportController.email("STAGE+ 4.4 " + LogHelper.roomNameAsLink(myRoom.name) + " 2 towers");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) < 2) {
            myRoom.roomStage = 4.2;
            ReportController.email("STAGE- 4.2 " + LogHelper.roomNameAsLink(myRoom.name) + " 2 towers");
            return true;
        }
        return false;
    }

    public static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, room, 2);
    }
}
