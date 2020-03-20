import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
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
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) === 6) {
            myRoom.roomStage = 7.4;
            ReportController.email("STAGE+ 7.4 " + LogHelper.roomNameAsLink(myRoom.name) + " 6 towers");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) < 6) {
            myRoom.roomStage = 7.2;
            ReportController.email("STAGE- 7.2 " + LogHelper.roomNameAsLink(myRoom.name) + " 6 towers");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, room, 6);
    }
}
