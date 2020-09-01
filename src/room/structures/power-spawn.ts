import {ReportController} from "../../reporting/report-controller";
import {Constants} from "../../global/constants/constants";

export class RoomPowerSpawnController {
    public static run(myRoom: MyRoom, room: Room): void {
        this.determinePowerSpawnStatus(myRoom, room);
    }

    private static determinePowerSpawnStatus(myRoom: MyRoom, room: Room): void {
        if (myRoom.powerSpawn == null) {
            return;
        }

        const powerSpawns: StructurePowerSpawn[] = room.find<StructurePowerSpawn>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_POWER_SPAWN;
                }
            }
        );
        if (powerSpawns.length !== 1) {
            ReportController.email("ERROR: powerSpawns length isn't 1, setting it to null");
            myRoom.powerSpawn = null;
            return;
        }

        const powerSpawn: StructurePowerSpawn = powerSpawns[0];
        if (powerSpawn.store.energy <= Constants.POWER_SPAWN_RESTOCK_WHEN_ENERGY_BELOW) {
            myRoom.powerSpawn.resources = "Restock";
        } else {
            myRoom.powerSpawn.resources = "Good";
        }

        if (powerSpawn.store.energy >= 1 &&
            powerSpawn.store.power >= 1) {
            powerSpawn.processPower();
        }
    }
}