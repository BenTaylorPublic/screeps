import { HelperFunctions } from "../../global/helper-functions";
import { StageFunctions } from "./stage-functions";

// tslint:disable-next-line: class-name
export class Stage5_2 {
    /*
    5.2 -> 5.4 : Room has 3 links
    5.2 <- 5.4 : Room has < 3 links
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_LINK) >= 3) {
            myRoom.roomStage = 5.4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.4");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_LINK) < 3) {
            myRoom.roomStage = 5.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5.2");
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
