import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MapHelper} from "../../global/helpers/map-helper";

export class SpawnLaborer {
    public static laborerSpawnLogic(myRoom: MyRoom, room: Room): void {
        if (myRoom.roomStage >= 5.4) {
            //From 5.4, sources are linked
            this.linkedRoomSpawnLogic(myRoom, room);
        } else {
            this.nonLinkedRoomSpawnLogic(myRoom, room);
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return CreepHelper.generateBody(
            [MOVE, MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK],
            Game.rooms[myRoom.name],
            true);
    }

    public static getForceBody(myRoom: MyRoom): BodyPartConstant[] {
        return CreepHelper.generateBody(
            [MOVE, MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK],
            Game.rooms[myRoom.name],
            false);
    }

    private static linkedRoomSpawnLogic(myRoom: MyRoom, room: Room): void {
        let bankLinkerAliveOrSpawning: boolean = false;
        let minersAliveOrSpawningCount: number = 0;
        let stockerAliveOrSpawning: boolean = false;
        let laborerAliveOrSpawningCount: number = 0;
        let forceLaborerQueuedCount: number = 0;
        let laborerCount: number = 0;

        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Laborer") {
                laborerCount++;
                if (myCreep.spawningStatus !== "queued") {
                    laborerAliveOrSpawningCount++;
                } else {
                    for (let j = 0; j < myRoom.spawnQueue.length; j++) {
                        if (myRoom.spawnQueue[j].role === "ForceLaborer" &&
                            myRoom.spawnQueue[j].name === myCreep.name) {
                            forceLaborerQueuedCount++;
                        }
                    }
                }
            } else if (myCreep.role === "BankLinker") {
                bankLinkerAliveOrSpawning = true;
            } else if (myCreep.role === "Stocker") {
                stockerAliveOrSpawning = true;
            } else if (myCreep.role === "Miner") {
                minersAliveOrSpawningCount++;
            }
        }

        let forceSpawnlaborers: number = 0;
        if ((!bankLinkerAliveOrSpawning ||
            minersAliveOrSpawningCount < myRoom.mySources.length ||
            !stockerAliveOrSpawning) &&
            laborerAliveOrSpawningCount === 0 &&
            forceLaborerQueuedCount === 0 &&
            //4000 is a magical number I just made up
            //For 4000 energy, the room should be able to spawn any of the economy dependent creeps
            //Hopefully this magical number doesn't come back to bite me
            room.energyAvailable < 4000) {
            forceSpawnlaborers = 1;
        }


        //When stage 8, only spawn laborers when the controller is 50% on the way to downgrade
        //Or, when a lot of energy (in trySpawnLaborer)
        if (forceSpawnlaborers === 0 &&
            myRoom.roomStage === 8 &&
            laborerAliveOrSpawningCount === 0 &&
            (
                (room.controller as StructureController).ticksToDowngrade < Constants.STAGE_8_SPAWN_LABORERS_WHEN_CONTROLLER_BENEATH ||
                room.find(FIND_CONSTRUCTION_SITES).length === 0
            )
        ) {
            forceSpawnlaborers = 1;
        } else {
            forceSpawnlaborers = 0;
        }

        if (forceSpawnlaborers > 0) {
            SpawnLaborer.forceSpawnLaborers(myRoom, forceSpawnlaborers);
        } else {
            let maxLaborers: number = Constants.MAX_LABORERS;
            if (myRoom.roomStage === 8 &&
                room.find(FIND_CONSTRUCTION_SITES).length === 0) {
                maxLaborers = Constants.MAX_LABORERS_STAGE_8;
            }
            SpawnLaborer.trySpawnLaborer(myRoom, laborerCount, maxLaborers);
        }
    }

    private static nonLinkedRoomSpawnLogic(myRoom: MyRoom, room: Room): void {
        let laborerCount: number = 0;
        let laborerAliveOrSpawningCount: number = 0;
        let forceLaborerQueuedCount: number = 0;

        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Laborer") {
                laborerCount++;
                if (myCreep.spawningStatus !== "queued") {
                    laborerAliveOrSpawningCount++;
                } else {
                    for (let j = 0; j < myRoom.spawnQueue.length; j++) {
                        if (myRoom.spawnQueue[j].role === "ForceLaborer" &&
                            myRoom.spawnQueue[j].name === myCreep.name) {
                            forceLaborerQueuedCount++;
                        }
                    }
                }
            }
        }

        let forceSpawnlaborers: number = 0;

        if (laborerAliveOrSpawningCount === 0 &&
            forceLaborerQueuedCount === 0 &&
            //Stops it spamming other rooms when it doesn't have a spawn itself
            myRoom.roomStage >= 1) {
            forceSpawnlaborers = 1;
        } else if (laborerCount < Constants.MIN_LABORERS) {
            forceSpawnlaborers = Constants.MIN_LABORERS - laborerCount;
        }

        if (forceSpawnlaborers > 0) {
            SpawnLaborer.forceSpawnLaborers(myRoom, forceSpawnlaborers);
        } else {
            let maxLaborers: number = Constants.MAX_LABORERS;
            if (myRoom.roomStage === 8 &&
                room.find(FIND_CONSTRUCTION_SITES).length === 0) {
                maxLaborers = Constants.MAX_LABORERS_STAGE_8;
            }
            SpawnLaborer.trySpawnLaborer(myRoom, laborerCount, maxLaborers);
        }
    }

    private static trySpawnLaborer(myRoom: MyRoom, laborerCount: number, maxLaborers: number): void {
        let spawn: boolean = (myRoom.roomStage < 4 &&
            laborerCount < Constants.LABORERS_BEFORE_BANK);
        if (!spawn) {
            if (myRoom.bank == null) {
                //Only spawn laborers through this method if the bank is real
                return;
            }

            const bank: StructureStorage | null = myRoom.bank.object;
            if (bank == null) {
                ReportController.email("ERROR: Bank is null when checking if it's full in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            const amountOfEnergyRequired: number = myRoom.roomStage === 8 ? Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER_STAGE_8 : Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER;

            spawn = (bank.store[RESOURCE_ENERGY] >= amountOfEnergyRequired &&
                laborerCount < maxLaborers &&
                //If constant is 100k, have 1 laborer until 200k, then 2 till 300k, then 3 (cap)
                laborerCount < Math.floor(bank.store[RESOURCE_ENERGY] / Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER));
        }

        if (spawn) {
            //If the bank is capped, spawn another laborer
            const newCreep: Laborer = this.spawnLaborer(myRoom, false);
            myRoom.myCreeps.push(newCreep);
            ReportController.log("Queued a new Laborer in " + LogHelper.roomNameAsLink(myRoom.name));
        }
    }

    private static forceSpawnLaborers(myRoom: MyRoom, amount: number): void {
        for (let i: number = 0; i < amount; i++) {
            const newCreep: Laborer | null = this.spawnLaborer(myRoom, true);
            myRoom.myCreeps.push(newCreep);
            ReportController.log("Force queued a new Laborer in " + LogHelper.roomNameAsLink(myRoom.name));
        }
    }

    private static spawnLaborer(myRoom: MyRoom, forceSpawn: boolean): Laborer {

        let roomToSpawnFromName: string | null;

        let roomToSpawnFrom: MyRoom;
        if (Game.rooms[myRoom.name].find<StructureSpawn>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_SPAWN;
            }
        }).length === 0) {
            // A room needs a laborer, but it has no spawns yet
            // Going to use the nearest room's spawn instead
            roomToSpawnFromName = MapHelper.findClosestSpawnRoomName(new RoomPosition(25, 25, myRoom.name), 4);
            if (roomToSpawnFromName == null) {
                ReportController.email("ERROR: Couldn't find any spawns to make a laborer for " + LogHelper.roomNameAsLink(myRoom.name));
                throw Error("Couldn't find any spawns to make a laborer for room " + myRoom.name);
            }
            roomToSpawnFrom = RoomHelper.getMyRoomByName(roomToSpawnFromName) as MyRoom;
        } else {
            roomToSpawnFrom = myRoom;
        }

        const name: string = CreepHelper.getName();
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

