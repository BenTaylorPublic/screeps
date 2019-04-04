import { roomController } from "room.controller";
import { memoryController } from "memory.controller";

console.log("Script reloaded");
setupMyMemory();

const room: MyRoom = Memory.myMemory.myRooms[0];
for (let i = 0; i < room.mySources.length; i++) {
    const mySource = room.mySources[i];
    mySource.minerName = null;
}
room.roomStage = 2.6;

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
