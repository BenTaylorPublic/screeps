"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_controller_1 = require("room.controller");
const memory_controller_1 = require("memory.controller");
console.log("Script reloaded");
setupMyMemory();
const room = Memory.myMemory.myRooms[0];
for (let i = 0; i < room.mySources.length; i++) {
    const mySource = room.mySources[i];
    mySource.minerName = null;
}
room.roomStage = 2.6;
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
            myRooms: []
        };
    }
}
