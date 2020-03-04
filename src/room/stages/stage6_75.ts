import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

// tslint:disable-next-line: class-name
export class Stage6_75 {
    /*
    6.75 ->  7   : Room has >= 2 spawn
    6.75 <-  7   : Room has < 2 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 2) {
            //Spawn has been made
            myRoom.roomStage = 7;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 7");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) < 2) {
            //Spawn has been made
            myRoom.roomStage = 6.75;
            ReportController.log("STAGE: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 6.75");
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
            ReportController.log("ATTENTION: Room " + HelperFunctions.roomNameAsLink(room.name) + " needs a spawn flag (spawn)");
        }
    }
}
