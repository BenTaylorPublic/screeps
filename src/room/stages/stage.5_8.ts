import { GlobalFunctions } from "../../global/global.functions";

// tslint:disable-next-line: class-name
export class Stage5_8 {
    /*
    5.8 ->  5.9 : Room has terminal
    5.8 <-  5.9 : Room has no terminal
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_TERMINAL) >= 1) {
            myRoom.roomStage = 5.9;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.9");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_TERMINAL) < 1) {
            myRoom.roomStage = 5.8;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5.8");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const roomFlags: Flag[] = GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "terminal") {
                roomFlags.splice(i, 1);
            }
        }

        let placedTerminal: boolean = false;
        if (roomFlags.length === 1) {
            const result: ScreepsReturnCode = roomFlags[0].pos.createConstructionSite(STRUCTURE_TERMINAL);
            if (result === OK) {
                placedTerminal = true;
            }
        }

        if (!placedTerminal &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " couldn't place an terminal (terminal)");
        }
    }
}
