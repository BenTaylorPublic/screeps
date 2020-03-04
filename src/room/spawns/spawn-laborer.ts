import {HelperFunctions} from "../../global/helper-functions";
import {Constants} from "../../global/constants";
import {ReportController} from "../../reporting/report-controller";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

export class SpawnLaborer {
    public static laborerSpawnLogic(myRoom: MyRoom): void {
        let laborerCount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "Laborer") {
                laborerCount++;
            }
        }

        //Force spawn a miner and worker if there are no creeps alive
        let forceSpawnlaborers: number = 0;
        if (laborerCount < Constants.MIN_LABORERS) {
            forceSpawnlaborers = Constants.MIN_LABORERS - laborerCount;
        } else if (laborerCount < Constants.LABORERS_BEFORE_BANK &&
            myRoom.roomStage < 4) {
            //Room stage 4 is when the bank is made
            //After then, haulers will exist
            forceSpawnlaborers = Constants.LABORERS_BEFORE_BANK - laborerCount;
        }

        if (forceSpawnlaborers > 0) {
            SpawnLaborer.forceSpawnLaborers(myRoom, forceSpawnlaborers);
        } else {
            if (!myRoom.pendingConscriptedCreep) {
                SpawnLaborer.trySpawnLaborer(myRoom, laborerCount);
            }
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return HelperFunctions.generateBody(
            [MOVE, MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK],
            Game.rooms[myRoom.name],
            true);
    }

    public static getForceBody(myRoom: MyRoom): BodyPartConstant[] {
        return HelperFunctions.generateBody(
            [MOVE, MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK],
            Game.rooms[myRoom.name],
            false);
    }

    private static trySpawnLaborer(myRoom: MyRoom, laborerCount: number): void {
        if (myRoom.bankPos == null) {
            //Only spawn laborers through this method if the bank is real
            return;
        }

        const bank: StructureStorage | null = myRoom.bank;
        if (bank == null) {
            ReportController.log("ERROR: Bank is null when checking if it's full in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }

        if (bank.store[RESOURCE_ENERGY] >= Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER &&
            laborerCount < Constants.MAX_LABORERS) {
            //If the bank is capped, spawn another laborer
            const newCreep: Laborer = this.spawnLaborer(myRoom, false);
            myRoom.myCreeps.push(newCreep);
            ReportController.log("Queued a new Laborer in " + HelperFunctions.roomNameAsLink(myRoom.name));
        }
    }

    private static forceSpawnLaborers(myRoom: MyRoom, amount: number): void {
        for (let i: number = 0; i < amount; i++) {
            const newCreep: Laborer | null = this.spawnLaborer(myRoom, true);
            myRoom.myCreeps.push(newCreep);
            ReportController.log("Force queued a new Laborer in " + HelperFunctions.roomNameAsLink(myRoom.name));
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
                ReportController.log("ERROR: Couldn't find any spawns to make a laborer for " + HelperFunctions.roomNameAsLink(myRoom.name));
                throw Error("Couldn't find any spawns to make a laborer for room " + myRoom.name);
            }
            roomToSpawnFrom = HelperFunctions.getMyRoomByName(spawn.room.name) as MyRoom;
        } else {
            roomToSpawnFrom = myRoom;
        }

        const name: string = "Creep" + HelperFunctions.getId();
        const priority: number = forceSpawn ? SpawnConstants.FORCE_LABORER : SpawnConstants.LABORER;
        const roleInQueue: CreepRoles | "ForceLaborer" = forceSpawn ? "ForceLaborer" : "Laborer";
        SpawnQueueController.queueCreepSpawn(roomToSpawnFrom, priority, name, roleInQueue);

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

