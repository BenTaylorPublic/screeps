import {HelperFunctions} from "../global/helper-functions";
import {ReportController} from "../reporting/report-controller";

export class SpawnClaimerController {
    public static run(): void {
        const flagNames: string[] = Object.keys(Game.flags);
        let flag: Flag | null = null;
        for (let i = 0; i < flagNames.length; i++) {
            if (flagNames[i] !== "claim") {
                continue;
            }
            flag = Game.flags[flagNames[i]];
            //Do not continue through the rest of the flags
            break;
        }

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
            for (let j = 0; j < Memory.myMemory.empire.creeps.length; j++) {
                const claimer: MyCreep = Memory.myMemory.empire.creeps[j];
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
                    Memory.myMemory.empire.creeps.push(claimer);
                }
            }
        }
    }

    private static spawnClaimer(flag: Flag): Claimer | null {

        const spawn: StructureSpawn | null = HelperFunctions.findClosestSpawn(flag.pos);
        if (spawn == null) {
            flag.remove();
            ReportController.log("ERROR",  "Couldn't find a spawn to make a claimer");
            return null;
        }

        //Have a valid spawn now

        const id = HelperFunctions.getId();
        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                [MOVE, CLAIM],
                "Creep" + id,
                {
                    memory:
                        {
                            name: "Creep" + id,
                            role: "Claimer",
                            assignedRoomName: flag.pos.roomName
                        }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "Claimer",
                assignedRoomName: flag.pos.roomName,
                flagName: flag.name
            };
        }
        return null;
    }

}

