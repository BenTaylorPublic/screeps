import {Constants} from "../../global/constants/constants";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";

export class SpawnHauler {
    public static spawnHaulerLogic(myRoom: MyRoom): void {
        if (myRoom.roomStage < 4) {
            //No need for haulers before the bank is setup
            return;
        }

        this.sourceLogic(myRoom);
        this.diggingLogic(myRoom);
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return CreepHelper.generateBody([MOVE, CARRY],
            [MOVE, CARRY],
            Game.rooms[myRoom.name],
            true,
            20);
    }

    private static diggingLogic(myRoom: MyRoom): void {
        if (Game.time % 100 !== 0) {
            return;
        }
        if (myRoom.roomStage < Constants.MINERAL_START_STAGE ||
            !myRoom.digging.active ||
            myRoom.digging.haulerName != null ||
            myRoom.digging.cache == null) {
            return;
        } else {
            const minerals: Mineral[] = Game.rooms[myRoom.name].find(FIND_MINERALS);
            if (minerals.length === 1 &&
                minerals[0].mineralAmount === 0) {
                return;
            }
        }
        const hauler: Hauler = this.spawnHaulerInternalForDigging(myRoom);
        myRoom.myCreeps.push(hauler);
        myRoom.digging.haulerName = hauler.name;
        ReportController.log("Queued a Digging Hauler in " + LogHelper.roomNameAsLink(myRoom.name));
    }

    private static sourceLogic(myRoom: MyRoom): void {
        for (let i: number = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.cache == null ||
                mySource.cache.id == null) {
                continue;
            }
            const myCache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
            if (mySource.state === "Cache" &&
                mySource.haulerName == null &&
                myCache != null &&
                myCache.store.energy >= myCache.store.getCapacity() * Constants.PERCENT_OF_CACHE_ENERGY_TO_SPAWN_HAULER) {
                //Spawn a new hauler
                const newCreep: Hauler = this.spawnHaulerInternalForSource(myRoom, mySource);
                myRoom.myCreeps.push(newCreep);
                mySource.haulerName = newCreep.name;
                ReportController.log("Queued a new hauler in " + LogHelper.roomNameAsLink(myRoom.name));

            }
        }
    }

    private static spawnHaulerInternalForSource(myRoom: MyRoom, mySource: MySource): Hauler {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.HAULER, name, "Hauler");


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

    private static spawnHaulerInternalForDigging(myRoom: MyRoom): Hauler {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.DIGGING_HAULER, name, "Hauler");

        return {
            name: name,
            role: "Hauler",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            cachePosToPickupFrom: (myRoom.digging.cache as MyCache).pos,
            pickup: true
        };
    }

}
