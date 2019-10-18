import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {LiveController} from "./live/live-controller";
import {EmpireController} from "./empire/empire-controller";

console.log("Script reloaded");
setupMyMemory();

for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
    Memory.myMemory.myRooms[i].outLinks = [];
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
