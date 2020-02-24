import {HelperFunctions} from "../../global/helper-functions";
import {Constants} from "../../global/constants";
import {ReportController} from "../../reporting/report-controller";

export class SpawnHauler {
    public static trySpawnHauler(myRoom: MyRoom): void {
        if (myRoom.roomStage < 4) {
            //No need for haulers before the bank is setup
            return;
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.cache == null ||
                mySource.cache.id == null) {
                continue; //Skip this source
            }
            const myCache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
            if (mySource.state === "Cache" &&
                mySource.haulerNames.length < Constants.MAX_HAULERS_PER_SOURCE &&
                mySource.haulerCooldown === 0 &&
                myCache != null &&
                myCache.store.energy >= myCache.store.getCapacity() * Constants.PERCENT_OF_CACHE_ENERGY_TO_SPAWN_HAULER) {
                //Spawn a new hauler
                const newCreep: Hauler | null = this.spawnHauler(myRoom, mySource);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    mySource.haulerNames.push(newCreep.name);
                    console.log("LOG: Spawned a new hauler");

                    //+50 for the ticks to make the body
                    const haulerCooldown: number = Math.round(
                        50 +
                        (Game.spawns[myRoom.spawns[0].name].pos.getRangeTo(myCache.pos) *
                            Constants.HAULER_COOLDOWN_DISTANCE_FACTOR));
                    mySource.haulerCooldown = haulerCooldown;
                    return;
                }
            }

        }
    }

    private static spawnHauler(myRoom: MyRoom, mySource: MySource): Hauler | null {
        if (myRoom.spawns.length === 0) {
            ReportController.log("ERROR", "Attempted to spawn hauler in a room with no spawner (1)");
            return null;
        }
        const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

        if (spawn == null) {
            ReportController.log("ERROR", "Attempted to spawn hauler in a room with no spawner (2)");
            return null;
        }

        if (mySource.cache == null) {
            ReportController.log("ERROR", "Attempted to spawn hauler for a source with no cache pos");
            return null;
        }

        //Have a valid spawn now
        const body: BodyPartConstant[] = HelperFunctions.generateBody([MOVE, CARRY], [MOVE, CARRY], spawn.room, true, 10);

        const id = HelperFunctions.getId();
        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                body,
                "Creep" + id
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "Hauler",
                assignedRoomName: spawn.room.name,
                spawningStatus: "queued",
                roomMoveTarget: {
                    pos: null,
                    path: []
                },
                cachePosToPickupFrom: mySource.cache.pos,
                pickup: true
            };
        }
        return null;
    }

}
