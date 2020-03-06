import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

// tslint:disable-next-line: class-name
export class Stage7_8 {
    /*
    7.8 ->  8   : Room has == 1 power spawn
    7.8 <-  8   : Room has < 1 power spawn
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_POWER_SPAWN) === 1) {
            //Power spawn has been made
            if (myRoom.powerSpawnId == null) {

                const powerSpawns: StructurePowerSpawn[] = room.find<StructurePowerSpawn>(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            return structure.structureType === STRUCTURE_TOWER;
                        }
                    }
                );
                if (powerSpawns.length === 1) {
                    myRoom.powerSpawnId = powerSpawns[0].id;
                }
            }
            myRoom.roomStage = 8;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 8");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_POWER_SPAWN) < 1) {
            //Power spawn has been made
            myRoom.roomStage = 7.8;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 7.8");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            if (roomFlag.name !== "power-spawn") {
                roomFlags.splice(i, 1);
            }
        }

        let placedPowerSpawn: boolean = false;
        if (roomFlags.length === 1) {
            const result: ScreepsReturnCode = roomFlags[0].pos.createConstructionSite(STRUCTURE_POWER_SPAWN);
            if (result === OK) {
                placedPowerSpawn = true;
                roomFlags[0].remove();
            }
        }

        if (!placedPowerSpawn &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
            ReportController.email("ATTENTION: Room " + HelperFunctions.roomNameAsLink(room.name) + " needs a power spawn flag (power-spawn)",
                ReportCooldownConstants.DAY);
        }
    }
}
