import { GlobalFunctions } from "../../global/global.functions";
import { StageFunctions } from "./stage.functions";

// tslint:disable-next-line: class-name
export class Stage1_3 {
    /*
    1.3 ->  1.6 : Room has >= 5 extensions
    1.3 <-  1.6 : Room has < 5 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 5) {
            myRoom.roomStage = 1.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1.6");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 5) {
            myRoom.roomStage = 1.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.3");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, 5);
    }
}
