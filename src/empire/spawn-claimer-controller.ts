
import {ReportController} from "../reporting/report-controller";
import {SpawnQueueController} from "../global/spawn-queue-controller";
import {SpawnConstants} from "../global/spawn-constants";

export class SpawnClaimerController {
    public static run(myMemory: MyMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }
        const flag: Flag | null = Game.flags["claim"];
        if (flag == null) {
            return;
        }

        //There is a claim flag
        if (flag.room != null &&
            flag.room.controller != null &&
            flag.room.controller.my === true) {
            //Room has been claimed, remove flag
            flag.remove();

            ReportController.log("Room " + LogHelper.roomNameAsLink(flag.room.name) + " has been claimed");
        } else {
            //Room has not been claimed yet
            let claimerAlreadyMade: boolean = false;
            for (let j = 0; j < myMemory.empire.creeps.length; j++) {
                const claimer: MyCreep = myMemory.empire.creeps[j];
                if (claimer.role === "Claimer") {
                    claimerAlreadyMade = true;
                    break;
                }
            }
            if (!claimerAlreadyMade) {
                //Make a claimer
                const claimer: Claimer | null = this.spawnClaimer(flag);
                if (claimer != null) {
                    myMemory.empire.creeps.push(claimer);
                }
            }
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return HelperFunctions.generateBody([MOVE, CLAIM],
            [MOVE],
            Game.rooms[myRoom.name],
            true,
            6);
    }

    private static spawnClaimer(flag: Flag): Claimer | null {

        const spawn: StructureSpawn | null = HelperFunctions.findClosestSpawn(flag.pos, 3);
        if (spawn == null) {
            flag.remove();
            ReportController.email("ERROR: Couldn't find a spawn to make a claimer for " + LogHelper.roomNameAsLink(flag.pos.roomName));
            return null;
        }

        const roomToSpawnFrom: MyRoom = RoomHelper.getMyRoomByName(spawn.room.name) as MyRoom;

        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(roomToSpawnFrom, SpawnConstants.CLAIMER, name, "Claimer");
        ReportController.log("Queued a new claimer in " + LogHelper.roomNameAsLink(roomToSpawnFrom.name) + " for " + LogHelper.roomNameAsLink(flag.pos.roomName));

        return {
            name: name,
            role: "Claimer",
            assignedRoomName: flag.pos.roomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            flagName: flag.name
        };

    }

}

