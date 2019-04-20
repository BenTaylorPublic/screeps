import { roomController } from "room.controller";
import { memoryController } from "memory.controller";
import { roleClaimer } from "role.claimer";
import { liveSpawnClaimers } from "live.spawn.claimer";
import { liveController } from "live.controller";

console.log("Script reloaded");
setupMyMemory();
Memory.myMemory.myRooms[0].bankPos = null;

export const loop: any = function () {
    memoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        roomController.run(Memory.myMemory.myRooms[i]);
    }

    liveController.run();

    for (let i = 0; i < Memory.myMemory.myTravelingCreeps.length; i++) {
        const travelingCreep: MyCreep = Memory.myMemory.myTravelingCreeps[i];
        if (travelingCreep.role === "Claimer") {
            roleClaimer.run(travelingCreep);
        }
    }

};

function setupMyMemory(): void {
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: []
        };
    }
}
