"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_controller_1 = require("room.controller");
const memory_controller_1 = require("memory.controller");
console.log("Script reloaded");
setupMyMemory();
const room = Memory.myMemory.myRooms[0];
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
    }
    else if (mySource.id === "5bbcaa719099fc012e6315f7") {
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
delete room.myContainers;
for (let i = 0; i < room.mySources.length; i++) {
    const element = room.mySources[i];
    element.haulerNames = [];
}
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
