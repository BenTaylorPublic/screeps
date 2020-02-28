import {HelperFunctions} from "../../global/helper-functions";
import {Constants} from "../../global/constants";
import {ReportController} from "../../reporting/report-controller";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

export class SpawnLaborer {
    public static trySpawnLaborer(myRoom: MyRoom, laborerCount: number): void {
        if (myRoom.bankPos == null) {
            //Only spawn laborers through this method if the bank is real
            return;
        }

        const bank: StructureStorage | null = myRoom.bank;
        if (bank == null) {
            ReportController.log("ERROR", "Bank is null when checking if it's full");
            return;
        }

        if (bank.store[RESOURCE_ENERGY] >= Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER &&
            laborerCount < Constants.MAX_LABORERS) {
            //If the bank is capped, spawn another laborer
            const newCreep: Laborer | null = this.spawnLaborer(myRoom, false);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
            }
        }
    }

    public static forceSpawnLaborer(myRoom: MyRoom): void {
        const newCreep: Laborer | null = this.spawnLaborer(myRoom, true);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Force spawned a new Laborer");
        }
    }

    private static spawnLaborer(myRoom: MyRoom, forceSpawn: boolean): Laborer {

        let spawn: StructureSpawn | null;

        let roomToSpawnFrom: MyRoom;
        if (myRoom.spawns.length === 0 ||
            Game.spawns[myRoom.spawns[0].name] == null) {
            // A room needs a laborer, but it has no spawns yet
            // Going to use the nearest room's spawn instead
            spawn = HelperFunctions.findClosestSpawn(new RoomPosition(25, 25, myRoom.name));
            if (spawn == null) {
                ReportController.log("ERROR", "Couldn't find any spawns to make a laborer for room " + myRoom.name);
                throw Error("Couldn't find any spawns to make a laborer for room " + myRoom.name);
            }
            roomToSpawnFrom = HelperFunctions.getMyRoomByName(spawn.room.name) as MyRoom;
        } else {
            spawn = Game.spawns[myRoom.spawns[0].name];
            roomToSpawnFrom = myRoom;
        }

        const body: BodyPartConstant[] = HelperFunctions.generateBody(
            [MOVE, MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK],
            spawn.room,
            !forceSpawn);

        const name: string = "Creep" + Game.time;
        const priority: number = forceSpawn ? SpawnConstants.FORCE_LABORER : SpawnConstants.LABORER;
        SpawnQueueController.queueCreepSpawn(body, roomToSpawnFrom, priority, name);

        return {
            name: name,
            role: "Laborer",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            state: "Labor"
        };
    }

}

