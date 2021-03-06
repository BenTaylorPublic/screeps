import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage5_2 {
    /*
    5.2 -> 5.4 : Room has > sourceCount links
    5.2 <- 5.4 : Room has <= sourceCount links
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LINK) > myRoom.mySources.length) {
            myRoom.roomStage = 5.4;
            ReportController.email("STAGE+ 5.4 " + LogHelper.roomNameAsLink(myRoom.name) + " all sources linked");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LINK) <= myRoom.mySources.length) {
            myRoom.roomStage = 5.2;
            ReportController.email("STAGE- 5.2 " + LogHelper.roomNameAsLink(myRoom.name) + " all sources linked");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        //Source links
        StageFunctions.setupSourceLink(myRoom);
        StageFunctions.clearHaulersAndCaches(myRoom);
    }
}
