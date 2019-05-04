import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {LiveController} from "./live/live-controller";
import {EmpireController} from "./empire/empire-controller";

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

    LiveController.run();

    EmpireController.run(myMemory);

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        RoomController.run(myMemory.myRooms[i]);
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
                zergWithHeals: null
            }
        };
    }
}
