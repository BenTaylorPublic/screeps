import { roomController } from "room.controller";
import { memoryController } from "memory.controller";

console.log("Script reloaded");
setupMyMemory();

const room: MyRoom = Memory.myMemory.myRooms[0];
for (let i = 0; i < room.mySources.length; i++) {
    const source: MySource = room.mySources[i];
    if (source.cachePos != null &&
        source.cachePos.x === 19) {
        source.cachePos.x = 10;
    }
}

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
