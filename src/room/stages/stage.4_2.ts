import { GlobalFunctions } from "../../global/global.functions";
import { StageFunctions } from "./stage.functions";

// tslint:disable-next-line: class-name
export class Stage4_2 {
    /*
    4.2 ->  4.4 : Room has >= 2 tower
    4.2 <-  4.4 : Room has < 2 tower
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 2) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.4");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 2) {
            myRoom.roomStage = 4.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.2");
            return true;
        }
        return false;
    }

    public static step(myRoom: MyRoom, room: Room): void {
        StageFunctions.buildTowers(myRoom, 2);
    }
}
