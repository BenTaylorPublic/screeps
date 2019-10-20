import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";

console.log("Script reloaded");
setupMyMemory();

Memory.myMemory.empire = {
    attackOne: null
};

export const loop: any = function (): void {
    const myMemory: MyMemory = Memory.myMemory;
    MemoryController.run();

    const empireCommand: EmpireCommand = EmpireController.run(myMemory);

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        RoomController.run(myMemory.myRooms[i], empireCommand);
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
                attackOne: null
            }
        };
    }
}
