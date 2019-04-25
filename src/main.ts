import { RoomController } from "room.controller";
import { MemoryController } from "memory.controller";
import { RoleClaimer } from "role.claimer";
import { LiveController } from "live.controller";

console.log("Script reloaded");
setupMyMemory();

export const loop: any = function (): void {
    MemoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        RoomController.run(Memory.myMemory.myRooms[i]);
    }

    LiveController.run();

    for (let i = 0; i < Memory.myMemory.myTravelingCreeps.length; i++) {
        const travelingCreep: MyCreep = Memory.myMemory.myTravelingCreeps[i];
        if (travelingCreep.role === "Claimer") {
            RoleClaimer.run(travelingCreep as Claimer);
        }
    }

    MemoryController.clearBanks();
};

function setupMyMemory(): void {
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: []
        };
    }
}
