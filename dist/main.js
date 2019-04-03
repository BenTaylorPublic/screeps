"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_controller_1 = require("room.controller");
const memory_controller_1 = require("memory.controller");
console.log("Script reloaded");
setupMyMemory();
const room = Memory.myMemory.myRooms[0];
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
exports.loop = function () {
    memory_controller_1.memoryController.run();
    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        room_controller_1.roomController.run(Memory.myMemory.myRooms[i]);
    }
};
function setupMyMemory() {
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: [],
            prod: false
        };
    }
}
