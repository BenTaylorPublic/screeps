import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";
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
        if (RoomHelper.amountOfStructure(room, STRUCTURE_POWER_SPAWN) === 1) {
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
            ReportController.email("STAGE+ 8 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 power spawn");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_POWER_SPAWN) < 1) {
            //Power spawn has been made
            myRoom.roomStage = 7.8;
            ReportController.email("STAGE- 7.8 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 power spawn");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const flag: Flag | null = FlagHelper.getFlag(["power", "spawn"], myRoom.name);
        let placedPowerSpawn: boolean = false;
        if (flag != null) {
            const result: ScreepsReturnCode = flag.pos.createConstructionSite(STRUCTURE_POWER_SPAWN);
            if (result === OK) {
                placedPowerSpawn = true;
                flag.remove();
            }
        }

        if (!placedPowerSpawn &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_POWER_SPAWN) < 1) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs a power spawn flag (power-spawn)",
                ReportCooldownConstants.DAY);
        }
    }
}
