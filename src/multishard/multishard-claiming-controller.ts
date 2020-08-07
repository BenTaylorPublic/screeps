import {FlagHelper} from "../global/helpers/flag-helper";
import {RoomHelper} from "../global/helpers/room-helper";
import {MapHelper} from "../global/helpers/map-helper";
import {CreepHelper} from "../global/helpers/creep-helper";

export class MultishardClaimingController {
    public static run(): void {
        this.startClaimingProcessIfRequested();
        this.runMultishardClaimingCreeps();
    }

    private static runMultishardClaimingCreeps(): void {
        if (Game.flags["test-run-2"] != null) {
            Game.flags["test-run-2"].remove();
        } else {
            return;
        }

        for (const i in Game.creeps) {
            const creep: Creep = Game.creeps[i];
            if (creep.memory.multishardClaimCreep === true) {
                creep.suicide();
            }
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

        //Flag will be "multishard-claim-E5S30", where the roomcode is the room on the other shard to claim
        const roomTarget: string = flag.name.split("-")[2];
        const flagPos: MyRoomPos = RoomHelper.roomPosToMyPos(flag.pos);

        spawn.spawnCreep(body, name, {
            memory: {
                multishardClaimCreep: true,
                roomTarget: roomTarget,
                flagPos: flagPos,
            }
        });

    }
}