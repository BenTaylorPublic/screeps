"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_controller_1 = require("room.controller");
const memory_controller_1 = require("memory.controller");
console.log("Script reloaded");
setupMyMemory();
const room = Memory.myMemory.myRooms[0];
const creep = spawnLaborer(room);
if (creep != null) {
    room.myCreeps.push(creep);
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
function spawnLaborer(myRoom) {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (2)");
        return null;
    }
    //Have a valid spawn now
    const body = [MOVE, MOVE, CARRY, WORK];
    const id = 9999;
    const result = spawn.spawnCreep(body, "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name,
            pickup: true
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name,
            pickup: true
        };
    }
    console.log(result);
    return null;
}
