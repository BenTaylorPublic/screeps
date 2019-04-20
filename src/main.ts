import { roomController } from "room.controller";
import { memoryController } from "memory.controller";
import { roleClaimer } from "role.claimer";

console.log("Script reloaded");
setupMyMemory();

Memory.myMemory.myTravelingCreeps = [];

export const loop: any = function () {
    memoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        roomController.run(Memory.myMemory.myRooms[i]);
    }
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
