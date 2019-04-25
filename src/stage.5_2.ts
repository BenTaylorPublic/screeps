import { GlobalFunctions } from "global.functions";
import { StageFunctions } from "stage.functions";

// tslint:disable-next-line: class-name
export class Stage5_2 {
    /*
    5.2 ->  5.3 : Room has >= 40 extensions
    5.2 <-  5.3 : Room has < 40 extensions
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 40) {
            myRoom.roomStage = 5.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.3");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 40) {
            myRoom.roomStage = 5.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5.2");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildExtensions(myRoom, 40);
    }
}
