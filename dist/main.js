"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_controller_1 = require("room.controller");
const memory_controller_1 = require("memory.controller");
console.log("Script reloaded");
setupMyMemory();
const myRoom = Memory.myMemory.myRooms[0];
for (let i = 0; i < myRoom.myCreeps.length; i++) {
    const myCreep = myRoom.myCreeps[i];
    if (myCreep.role === "Laborer") {
        const laborer = myCreep;
        laborer.state = "Labor"; //Back to work lol
        delete laborer.mining;
    }
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
