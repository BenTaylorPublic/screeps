import { GlobalFunctions } from "global.functions";
import { StageFunctions } from "stage.functions";

// tslint:disable-next-line: class-name
export class Stage4_6 {
    /*
    4.6 ->  4.8 : Room has 2 links
    4.6 <-  4.8 : Room has < 2 links
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_LINK) >= 2) {
            myRoom.roomStage = 4.8;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.8");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_LINK) < 2) {
            myRoom.roomStage = 4.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.setupSourceLink(myRoom);
        // TODO: Setup bank link
    }
}
