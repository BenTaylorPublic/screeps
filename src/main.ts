import { roomController } from "room.controller";
import { memoryController } from "memory.controller";

console.log("Script reloaded");
setupMyMemory();

const room: MyRoom = Memory.myMemory.myRooms[0];
room.myContainers = [];
room.myContainers.push({
    id: "5ca03f4302585014d70b6e80",
    role: "SourceCache",
    assignedSourceId: "5bbcaa719099fc012e6315f9",
    haulerNames: []
});
room.myContainers.push({
    id: "5c9f5968e046575d330bf265",
    role: "SourceCache",
    assignedSourceId: "5bbcaa719099fc012e6315f7",
    haulerNames: []
});
room.myContainers.push({
    id: "5c9f42cde2fe140d3ade904b",
    role: "Bank",
    assignedSourceId: null,
    haulerNames: null
});

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
            myRooms: [],
            prod: false
        };
    }
}
