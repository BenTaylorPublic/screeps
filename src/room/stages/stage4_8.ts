import {LogHelper} from "../../global/helpers/log-helper";
import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";


// tslint:disable-next-line: class-name
export class Stage4_8 {
    /*
    4.8 ->  5   : Room has 1 sources using links, no cache or hauler
    4.8 <-  5   : Room has 0 sources using links, no cache or hauler
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null &&
                mySource.cache != null &&
                mySource.cache.id == null &&
                mySource.haulerName == null) {
                myRoom.roomStage = 5;
                ReportController.email("STAGE+ 5 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 source using links");
                return true;
            }
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        let foundLinkedSource: boolean = false;
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null &&
                mySource.cache != null &&
                mySource.cache.id == null &&
                mySource.haulerName == null) {
                foundLinkedSource = true;
                break;
            }
        }
        if (!foundLinkedSource) {
            myRoom.roomStage = 4.8;
            ReportController.email("STAGE- 4.8 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 source using links");
            return true;
        }
        return false;

    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.clearHaulersAndCaches(myRoom);
    }
}
