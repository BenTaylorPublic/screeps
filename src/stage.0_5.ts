import { GlobalFunctions } from "global.functions";

// tslint:disable-next-line: class-name
export class Stage0_5 {
    /*
    0.5 ->  1   : Room has >= 1 spawn
    0.5 <-  1   : Room has < 1 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            //Spawn has been made
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            //Spawn has been made
            myRoom.roomStage = 0.5;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.5");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        console.log("ATTENTION: Room " + room.name + " needs first spawn");
    }
}
