import {RoomHelper} from "../global/helpers/room-helper";
import {MapHelper} from "../global/helpers/map-helper";
import {CreepHelper} from "../global/helpers/creep-helper";
import {LogHelper} from "../global/helpers/log-helper";
import {MovementHelper} from "../global/helpers/movement-helper";
import {ReportController} from "../reporting/report-controller";

export class MultishardClaimingController {
    public static run(): void {
        this.startClaimingProcessIfRequested();
        this.claimingCreepLogic();
        this.laborerCreepLogic();
    }

    private static laborerCreepLogic(): void {
        this.spawningLaborerCreepLogic();

        //The creeps go into the second shard with a blank memory
        //Detect this, and give them a new memory
        const secondShardFlag: Flag | null = Game.flags["multishard-claim-target"];
        if (secondShardFlag != null &&
            Memory.myMemory.myRooms.length === 1) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[0];
            for (const i in Game.creeps) {
                const creep: Creep = Game.creeps[i];

                if (CreepHelper.creepContainsBodyPart(creep, WORK) &&
                    Object.keys(creep.memory).length === 0) {
                    let found: boolean = false;
                    for (let j: number = 0; j < myRoom.myCreeps.length; j++) {
                        if (myRoom.myCreeps[j].name === creep.name) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        //Need to add them
                        const laborer: Laborer = {
                            name: creep.name,
                            role: "Laborer",
                            assignedRoomName: myRoom.name,
                            spawningStatus: "alive",
                            roomMoveTarget: {
                                pos: null,
                                path: []
                            },
                            state: "Labor"
                        };
                        myRoom.myCreeps.push(laborer);
                        ReportController.log("Laborer creep assigned to room in target shard");
                    }
                }
            }
        } else {
            //Still in the first shard
            for (const i in Game.creeps) {
                const creep: Creep = Game.creeps[i];
                if (creep.memory.multishardLaborerCreep === true) {
                    this.runMultishardLaborerCreepFirstShard(creep);
                }
            }
        }
    }

    private static runMultishardLaborerCreepFirstShard(creep: Creep): void {
        //Okay here we go
        const creepMemory: MultishardLaborer = creep.memory as MultishardLaborer;

        if (creep.ticksToLive == null) {
            //Creep still spawning
            return;
        }

        if (creep.room.name !== creepMemory.waypoint.roomName) {
            //Still need to travel to the portal room
            creep.say("Traveling");
            MovementHelper.getCreepToRoom(creep, creepMemory as MyCreep, creepMemory.waypoint.roomName);
        } else {
            //Head to the portal
            MovementHelper.myMoveTo(creep, RoomHelper.myPosToRoomPos(creepMemory.waypoint), creepMemory as MyCreep);
        }

    }

    private static spawningLaborerCreepLogic(): void {
        const flag: Flag | null = Game.flags["multishard-claim-laborer"];
        if (flag != null) {
            flag.remove();
        } else {
            return;
        }

        const closestRoomName: string | null = MapHelper.findClosestSpawnRoomName(flag.pos);
        if (closestRoomName == null) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard laborer because findClosestSpawnRoomName couldn't find a spawn");
            return;
        }

        const room: Room | null = Game.rooms[closestRoomName];
        if (room == null) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard laborer because the room given was null");
            return;
        }

        const spawns: StructureSpawn[] = room.find<StructureSpawn>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_SPAWN;
            }
        });
        let spawn: StructureSpawn | null = null;
        for (let i: number = 0; i < spawns.length; i++) {
            if (spawns[i].spawning == null) {
                spawn = spawns[i];
                break;
            }
        }
        if (spawn == null) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard laborer because all the spawns were busy");
            return;
        }

        //Okay now we have a spawn and enough energy. Let's do it!
        const body: BodyPartConstant[] = CreepHelper.generateBody(
            [MOVE, MOVE, CARRY, WORK],
            [MOVE, MOVE, CARRY, WORK],
            Game.rooms[closestRoomName],
            true);

        if (room.energyAvailable < CreepHelper.bodyCost(body)) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard laborer because the room given didn't have enough energy");
            return;
        }

        const name: string = CreepHelper.getName();

        const portalPos: MyRoomPos = RoomHelper.roomPosToMyPos(flag.pos);

        const result: ScreepsReturnCode = spawn.spawnCreep(body, name, {
            memory: {
                multishardLaborerCreep: true,
                waypoint: portalPos,
                roomMoveTarget: {
                    pos: null,
                    path: []
                }
            } as MultishardLaborer
        });

        if (result === OK) {
            ReportController.log("Successfully spawned multishard laborer in " + LogHelper.roomNameAsLink(closestRoomName));
        } else {
            ReportController.log(LogHelper.logScreepsReturnCode(result));
        }
    }

    private static claimingCreepLogic(): void {
        //The creeps go into the second shard with a blank memory
        //Detect this, and give them a new memory
        const secondShardFlag: Flag | null = Game.flags["multishard-claim-target"];
        if (secondShardFlag != null) {
            //Flag will be "multishard-claim-target" in the room to claim
            const roomNameInTargetShard: string = secondShardFlag.pos.roomName;
            for (const i in Game.creeps) {
                const creep: Creep = Game.creeps[i];
                if (CreepHelper.creepContainsBodyPart(creep, CLAIM) &&
                    Object.keys(creep.memory).length === 0) {
                    creep.memory = {
                        multishardClaimCreep: true,
                        inSecondShard: true,
                        waypoint: {
                            x: 25,
                            y: 25,
                            roomName: roomNameInTargetShard
                        },
                        roomMoveTarget: {
                            pos: null,
                            path: []
                        }
                    } as MultishardClaimer;
                    ReportController.log("Multishard claimer made it to the target shard");

                }
            }
        }
        for (const i in Game.creeps) {
            const creep: Creep = Game.creeps[i];
            if (creep.memory.multishardClaimCreep === true) {
                if (creep.memory.inSecondShard === true) {
                    this.runMultishardClaimingCreepSecondShard(creep);
                } else {
                    this.runMultishardClaimingCreepFirstShard(creep);
                }
            }
        }
    }

    private static runMultishardClaimingCreepSecondShard(creep: Creep): void {
        const creepMemory: MultishardClaimer = creep.memory as MultishardClaimer;
        if (creep.room.name !== creepMemory.waypoint.roomName) {
            //Still need to travel to the claimable room
            creep.say("Traveling");
            MovementHelper.getCreepToRoom(creep, creepMemory as MyCreep, creepMemory.waypoint.roomName);
        } else {
            //In the room
            const controller: StructureController = creep.room.controller as StructureController;
            const result: ScreepsReturnCode = creep.claimController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                MovementHelper.myMoveTo(creep, controller.pos, creepMemory as MyCreep);
            } else if (result === OK) {
                creep.suicide();
            } else {
                ReportController.log(LogHelper.logScreepsReturnCode(result));
            }
        }
    }

    private static runMultishardClaimingCreepFirstShard(creep: Creep): void {
        //Okay here we go
        const creepMemory: MultishardClaimer = creep.memory as MultishardClaimer;

        if (creep.ticksToLive == null) {
            //Creep still spawning
            return;
        }

        if (creep.room.name !== creepMemory.waypoint.roomName) {
            //Still need to travel to the portal room
            creep.say("Traveling");
            MovementHelper.getCreepToRoom(creep, creepMemory as MyCreep, creepMemory.waypoint.roomName);
        } else {
            //Head to the portal
            MovementHelper.myMoveTo(creep, RoomHelper.myPosToRoomPos(creepMemory.waypoint), creepMemory as MyCreep);
        }

    }

    private static startClaimingProcessIfRequested(): void {
        const flag: Flag | null = Game.flags["multishard-claim-portal"];
        if (flag != null) {
            flag.remove();
        } else {
            return;
        }

        const closestRoomName: string | null = MapHelper.findClosestSpawnRoomName(flag.pos);
        if (closestRoomName == null) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard claimer because findClosestSpawnRoomName couldn't find a spawn");
            return;
        }

        const room: Room | null = Game.rooms[closestRoomName];
        if (room == null) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard claimer because the room given was null");
            return;
        }

        if (room.energyAvailable < 650) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard claimer because the room given didn't have enough energy");
            return;
        }

        const spawns: StructureSpawn[] = room.find<StructureSpawn>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_SPAWN;
            }
        });
        let spawn: StructureSpawn | null = null;
        for (let i: number = 0; i < spawns.length; i++) {
            if (spawns[i].spawning == null) {
                spawn = spawns[i];
                break;
            }
        }
        if (spawn == null) {
            //Uh oh
            ReportController.log("Unable to spawn a multishard claimer because all the spawns were busy");
            return;
        }

        //Okay now we have a spawn and enough energy. Let's do it!
        const body: BodyPartConstant[] = [CLAIM, MOVE];

        const name: string = CreepHelper.getName();

        const portalPos: MyRoomPos = RoomHelper.roomPosToMyPos(flag.pos);

        const result: ScreepsReturnCode = spawn.spawnCreep(body, name, {
            memory: {
                multishardClaimCreep: true,
                waypoint: portalPos,
                inSecondShard: false,
                roomMoveTarget: {
                    pos: null,
                    path: []
                }
            } as MultishardClaimer
        });

        if (result === OK) {
            ReportController.log("Successfully spawned multishard claimer in " + LogHelper.roomNameAsLink(closestRoomName));
        } else {
            ReportController.log(LogHelper.logScreepsReturnCode(result));
        }
    }
}