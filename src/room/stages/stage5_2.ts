import {HelperFunctions} from "../../global/helper-functions";
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
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_LINK) > myRoom.mySources.length) {
            myRoom.roomStage = 5.4;
            ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 5.4");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfExtensions(room, STRUCTURE_LINK) <= myRoom.mySources.length) {
            myRoom.roomStage = 5.2;
            ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 5.2");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        //Source links
        StageFunctions.setupSourceLink(myRoom);
        StageFunctions.setupOutLink(myRoom);
        StageFunctions.clearHaulersAndCaches(myRoom);
    }
}
