import { roomController } from "room.controller";
import { memoryController } from "memory.controller";

console.log("Script reloaded");
setupMyMemory();

const room: MyRoom = Memory.myMemory.myRooms[0];
room.myCreeps = [];
for (let i = 0; i < room.mySources.length; i++) {
    const mySource = room.mySources[i];
    mySource.haulerNames = [];
    if (mySource.id === "5bbcaa719099fc012e6315f9") {
        mySource.cachePos = {
            x: 5,
            y: 46,
            roomName: room.name
        };
    } else if (mySource.id === "5bbcaa719099fc012e6315f7") {
        mySource.cachePos = {
            x: 19,
            y: 3,
            roomName: room.name
        };
    }
}
room.bankPos = {
    x: 17,
    y: 26,
    roomName: room.name
};

for (let i = 0; i < room.mySources.length; i++) {
    const element = room.mySources[i];
    element.haulerNames = [];
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
