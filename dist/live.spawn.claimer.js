"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.liveSpawnClaimers = {
    run: function () {
        const flagNames = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-claim") {
                continue;
            }
            if (flag.room != null &&
                flag.room.controller != null &&
                flag.room.controller.my) {
                //Room has been claimed, remove flag
                flag.remove();
                console.log("LOG: Room " + flag.room.name + " has been claimed");
            }
            else {
                //Room has not been claimed yet
                let claimerAlreadyMade = false;
                for (let j = 0; j < Memory.myMemory.myTravelingCreeps.length; j++) {
                    const myTravelingCreep = Memory.myMemory.myTravelingCreeps[j];
                    if (myTravelingCreep.role === "Claimer") {
                        claimerAlreadyMade = true;
                        break;
                    }
                }
                if (!claimerAlreadyMade) {
                    //Make a claimer
                    const claimer = spawnClaimer(flag);
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
};
function spawnClaimer(flag) {
    const spawn = global_functions_1.globalFunctions.findClosestSpawn(flag.pos);
    if (spawn == null) {
        flag.remove();
        console.log("ERR: Couldn't find a spawn to make a claimer");
        return null;
    }
    //Have a valid spawn now
    const id = global_functions_1.globalFunctions.getId();
    const result = spawn.spawnCreep([MOVE, CLAIM], "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Claimer",
            assignedRoomName: ""
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Claimer",
            assignedRoomName: "",
            flagName: flag.name
        };
    }
    return null;
}
