import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

// tslint:disable-next-line: class-name
export class Stage7_7 {
    /*
    7.7 ->  7.8   : Room has nuker
    7.7 <-  7.8   : Room has no nuker
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_NUKER) === 1 &&
            myRoom.labs != null) {
            myRoom.roomStage = 7.8;
            ReportController.email("STAGE+ 7.8 " + LogHelper.roomNameAsLink(myRoom.name) + " nuker");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_NUKER) === 0 ||
            myRoom.labs == null) {
            myRoom.roomStage = 7.7;
            ReportController.email("STAGE- 7.7 " + LogHelper.roomNameAsLink(myRoom.name) + " nuker");
            return true;
        }
        return false;
    }

    private static step(room: Room): void {
        if (room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_NUKER) === 0) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs a nuker, place manually",
                ReportCooldownConstants.DAY);
        }
    }
}
