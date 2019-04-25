"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class LiveSpawnClaimer {
    static run() {
        const flagNames = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-claim") {
                continue;
            }
            if (flag.room != null &&
                flag.room.controller != null &&
                flag.room.controller.my) {
                flag.remove();
                console.log("LOG: Room " + flag.room.name + " has been claimed");
            }
            else {
                let claimerAlreadyMade = false;
                for (let j = 0; j < Memory.myMemory.myTravelingCreeps.length; j++) {
                    const myTravelingCreep = Memory.myMemory.myTravelingCreeps[j];
                    if (myTravelingCreep.role === "Claimer") {
                        claimerAlreadyMade = true;
                        break;
                    }
                }
                if (!claimerAlreadyMade) {
                    const claimer = this.spawnClaimer(flag);
                    if (claimer != null) {
                        console.log("LOG: Spawned a new claimer");
                        Memory.myMemory.myTravelingCreeps.push(claimer);
                    }
                }
            }
            return;
        }
    }
    static spawnClaimer(flag) {
        const spawn = global_functions_1.GlobalFunctions.findClosestSpawn(flag.pos);
        if (spawn == null) {
            flag.remove();
            console.log("ERR: Couldn't find a spawn to make a claimer");
            return null;
        }
        const id = global_functions_1.GlobalFunctions.getId();
        const result = spawn.spawnCreep([MOVE, CLAIM], "Creep" + id, {
            memory: {
                name: "Creep" + id,
                role: "Claimer",
                assignedRoomName: flag.pos.roomName
            }
        });
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
exports.LiveSpawnClaimer = LiveSpawnClaimer;
