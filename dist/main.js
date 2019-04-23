"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_controller_1 = require("room.controller");
const memory_controller_1 = require("memory.controller");
const role_claimer_1 = require("role.claimer");
const live_controller_1 = require("live.controller");
console.log("Script reloaded");
setupMyMemory();
//One time memory setting
for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
    const myRoom = Memory.myMemory.myRooms[i];
    myRoom.bankLinkerName = null;
    for (let j = 0; j < myRoom.mySources.length; j++) {
        const mySource = myRoom.mySources[j];
        mySource.link = null;
        mySource.state = "NoCache";
        mySource.cache = null;
    }
    for (let h = 0; h < myRoom.myCreeps.length; h++) {
        const myCreep = myRoom.myCreeps[h];
        if (myCreep.role === "Miner") {
            myCreep.linkIdToDepositTo = null;
        }
    }
}
exports.loop = function () {
    memory_controller_1.MemoryController.run();
    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        room_controller_1.RoomController.run(Memory.myMemory.myRooms[i]);
    }
    live_controller_1.LiveController.run();
    for (let i = 0; i < Memory.myMemory.myTravelingCreeps.length; i++) {
        const travelingCreep = Memory.myMemory.myTravelingCreeps[i];
        if (travelingCreep.role === "Claimer") {
            role_claimer_1.RoleClaimer.run(travelingCreep);
        }
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
