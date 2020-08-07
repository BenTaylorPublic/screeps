import {FlagHelper} from "../global/helpers/flag-helper";
import {RoomHelper} from "../global/helpers/room-helper";
import {MapHelper} from "../global/helpers/map-helper";
import {CreepHelper} from "../global/helpers/creep-helper";
import {LogHelper} from "../global/helpers/log-helper";
import {MovementHelper} from "../global/helpers/movement-helper";

export class MultishardClaimingController {
    public static run(): void {
        this.startClaimingProcessIfRequested();

        //The creeps go into the second shard with a blank memory
        //Detect this, and give them a new memory
        const secondShardFlag: Flag | null = FlagHelper.getFlag2(["multishard", "claim", "target"]);
        if (secondShardFlag != null) {
            secondShardFlag.remove();
            //Flag will be "multishard-claim-target" in the room to claim
            const roomNameInTargetShard: string = secondShardFlag.pos.roomName;
            for (const i in Game.creeps) {
                const creep: Creep = Game.creeps[i];
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
                console.log(LogHelper.logScreepsReturnCode(result));
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
        const flag: Flag | null = FlagHelper.getFlag2(["multishard", "claim"]);
        if (flag != null) {
            flag.remove();
        } else {
            return;
        }

        const closestRoomName: string | null = MapHelper.findClosestSpawnRoomName(flag.pos);
        if (closestRoomName == null) {
            //Uh oh
            console.log("Unable to spawn a multishard claimer because findClosestSpawnRoomName couldn't find a spawn");
            return;
        }

        const room: Room | null = Game.rooms[closestRoomName];
        if (room == null) {
            //Uh oh
            console.log("Unable to spawn a multishard claimer because the room given was null");
            return;
        }

        if (room.energyAvailable < 650) {
            //Uh oh
            console.log("Unable to spawn a multishard claimer because the room given didn't have enough energy");
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
            console.log("Unable to spawn a multishard claimer because all the spawns were busy");
            return;
        }

        //Okay now we have a spawn and enough energy. Let's do it!
        const body: BodyPartConstant[] = CreepHelper.generateBody([CLAIM, MOVE],
            [MOVE],
            room,
            false,
            //TODO: Change to 6 for final release (quicker spawn time for dev)
            2);

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
            console.log("Successfully spawned multishard claimer in " + closestRoomName);
        } else {
            console.log(LogHelper.logScreepsReturnCode(result));
        }
    }
}