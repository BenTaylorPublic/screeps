import {HelperFunctions} from "../global/helper-functions";
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

            ReportController.log("OTHER", "Room " + flag.room.name + " has been claimed");
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
                    console.log("LOG: Spawned a new claimer");
                    myMemory.empire.creeps.push(claimer);
                }
            }
        }
    }

    private static spawnClaimer(flag: Flag): Claimer | null {

        const spawn: StructureSpawn | null = HelperFunctions.findClosestSpawn(flag.pos);
        if (spawn == null) {
            flag.remove();
            ReportController.log("ERROR", "Couldn't find a spawn to make a claimer");
            return null;
        }

        const roomToSpawnFrom: MyRoom = HelperFunctions.getMyRoomByName(spawn.room.name) as MyRoom;

        const name: string = "Creep" + HelperFunctions.getId();
        SpawnQueueController.queueCreepSpawn([MOVE, CLAIM], roomToSpawnFrom, SpawnConstants.CLAIMER, name);

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

