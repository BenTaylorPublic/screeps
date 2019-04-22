import { GlobalFunctions } from "global.functions";

export class LiveSpawnClaimer {
    static run(): void {
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-claim") { continue; }

            if (flag.room != null &&
                flag.room.controller != null &&
                flag.room.controller.my) {
                //Room has been claimed, remove flag
                flag.remove();
                console.log("LOG: Room " + flag.room.name + " has been claimed");
            } else {
                //Room has not been claimed yet
                let claimerAlreadyMade: boolean = false;
                for (let j = 0; j < Memory.myMemory.myTravelingCreeps.length; j++) {
                    const myTravelingCreep: MyCreep = Memory.myMemory.myTravelingCreeps[j];
                    if (myTravelingCreep.role === "Claimer") {
                        claimerAlreadyMade = true;
                        break;
                    }
                }
                if (!claimerAlreadyMade) {
                    //Make a claimer
                    const claimer: Claimer | null = LiveSpawnClaimer.spawnClaimer(flag);
                    if (claimer != null) {
                        console.log("LOG: Spawned a new claimer");
                        Memory.myMemory.myTravelingCreeps.push(claimer);
                    }
                }
            }
            //Do not continue through the rest of the flags
            return;
        }
    }

    private static spawnClaimer(flag: Flag): Claimer | null {

        const spawn: StructureSpawn | null = GlobalFunctions.findClosestSpawn(flag.pos);
        if (spawn == null) {
            flag.remove();
            console.log("ERR: Couldn't find a spawn to make a claimer");
            return null;
        }

        //Have a valid spawn now

        const id = GlobalFunctions.getId();
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

