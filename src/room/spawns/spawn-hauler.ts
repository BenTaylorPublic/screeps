import {HelperFunctions} from "../../global/helper-functions";
import {Constants} from "../../global/constants";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

export class SpawnHauler {
    public static spawnHaulerLogic(myRoom: MyRoom): void {
        if (myRoom.roomStage < 4) {
            //No need for haulers before the bank is setup
            return;
        }

        for (let i: number = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.cache == null ||
                mySource.cache.id == null) {
                return;
            }
            const myCache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
            if (mySource.state === "Cache" &&
                mySource.haulerNames.length < Constants.MAX_HAULERS_PER_SOURCE &&
                mySource.haulerCooldown === 0 &&
                myCache != null &&
                myCache.store.energy >= myCache.store.getCapacity() * Constants.PERCENT_OF_CACHE_ENERGY_TO_SPAWN_HAULER) {
                //Spawn a new hauler
                const newCreep: Hauler = this.spawnHaulerInternal(myRoom, mySource);
                myRoom.myCreeps.push(newCreep);
                mySource.haulerNames.push(newCreep.name);
                console.log("LOG: Queued a new hauler in " + HelperFunctions.roomNameAsLink(myRoom.name));

                //+50 for the ticks to make the body
                const haulerCooldown: number = Math.round(
                    50 +
                    (Game.spawns[myRoom.spawns[0].name].pos.getRangeTo(myCache.pos) *
                        Constants.HAULER_COOLDOWN_DISTANCE_FACTOR));
                mySource.haulerCooldown = haulerCooldown;

            }
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return HelperFunctions.generateBody([MOVE, CARRY],
            [MOVE, CARRY],
            Game.rooms[myRoom.name],
            true,
            20);
    }

    private static spawnHaulerInternal(myRoom: MyRoom, mySource: MySource): Hauler {
        const body = this.getBody(myRoom);
        const name: string = "Creep" + HelperFunctions.getId();
        SpawnQueueController.queueCreepSpawn(body, myRoom, SpawnConstants.HAULER, name, "Hauler");


        return {
            name: name,
            role: "Hauler",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            cachePosToPickupFrom: (mySource.cache as MyCache).pos,
            pickup: true
        };
    }

}
