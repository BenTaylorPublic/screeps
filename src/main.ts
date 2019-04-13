import { roomController } from "room.controller";
import { memoryController } from "memory.controller";

console.log("Script reloaded");
setupMyMemory();

const myRoom: MyRoom = Memory.myMemory.myRooms[0];
myRoom.myExtensionPositions = [];
myRoom.myTowerPositions = [];

export const loop: any = function () {
    memoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        roomController.run(Memory.myMemory.myRooms[i]);
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
