import { GlobalFunctions } from "global.functions";
import { StageFunctions } from "stage.functions";

// tslint:disable-next-line: class-name
export class Stage4_8 {
    /*
    4.8 ->  5   : Room has 1 sources using links, no cache or hauler
    4.8 <-  5   : Room has 0 sources using links, no cache or hauler
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {

    }
}
