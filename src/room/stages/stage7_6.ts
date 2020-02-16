import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage7_6 {
    /*
    7.6 ->  7.8   : Room has >= 3 spawn
    7.6 <-  7.8   : Room has < 3 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 3) {
            //Spawn has been made
            myRoom.roomStage = 7.8;
            ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 7.8");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) < 3) {
            //Spawn has been made
            myRoom.roomStage = 7.6;
            ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 7.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "spawn") {
                roomFlags.splice(i, 1);
            }
        }

        let placedSpawn: boolean = false;
        if (roomFlags.length === 1) {
            const result: ScreepsReturnCode = roomFlags[0].pos.createConstructionSite(STRUCTURE_SPAWN);
            if (result === OK) {
                placedSpawn = true;
                roomFlags[0].remove();
            }
        }

        if (!placedSpawn &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs a spawn flag (spawn)");
        }
    }
}
