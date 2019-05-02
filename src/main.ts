import { RoomController } from "./room/room-controller";
import { MemoryController } from "./memory/memory-controller";
import { RoleClaimer } from "./room/roles/claimer";
import {LiveController} from "./live/live-controller";

console.log("Script reloaded");
setupMyMemory();

Memory.myMemory.empire = {
    WarZergWithHeals: null
};

for (let i = 0; i < Memory.myMemory.myRooms; i++) {
    const myRoom: any = Memory.myMemory.myRooms[i];
    delete myRoom.myExtensionPositions;
    delete myRoom.myTowerPositions;
}

export const loop: any = function (): void {
    const myMemory: MyMemory = Memory.myMemory;
    MemoryController.run();

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        RoomController.run(myMemory.myRooms[i]);
    }

    LiveController.run();

    //TODO: Create an empire controller
    //TODO: Move claimer logic into an empire role
    for (let i = 0; i < myMemory.myTravelingCreeps.length; i++) {
        const travelingCreep: MyCreep = myMemory.myTravelingCreeps[i];
        if (travelingCreep.role === "Claimer") {
            RoleClaimer.run(travelingCreep as Claimer);
        }
    }

    MemoryController.clearBanks();
};

function setupMyMemory(): void {
    let myMemory: MyMemory = Memory.myMemory;
    if (myMemory == null) {
        myMemory = {
            globalId: 0,
            myRooms: [],
            myTravelingCreeps: [],
            empire: {
                war1: null
            }
        };
    }
}
