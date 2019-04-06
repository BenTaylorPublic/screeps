"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("global");
exports.roomSpawnMinerAndWorker = {
    trySpawnMinerAndWorker: function (myRoom) {
        const newCreep = spawnMinerAndWorker(myRoom.spawnName);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Spawned a new MinerAndWorker");
        }
    }
};
function spawnMinerAndWorker(spawnName) {
    if (spawnName == null) {
        return null; //spawn name not set
    }
    const spawn = Game.spawns[spawnName];
    const id = global_1.global.getId();
    if (spawn.spawnCreep([MOVE, MOVE, CARRY, WORK], "Creep" + id, {
        memory: {
            name: "Creep" + id,
            assignedRoomName: spawn.room.name,
            role: "MinerAndWorker",
            mining: true
        }
    }) === OK) {
        return {
            name: "Creep" + id,
            role: "MinerAndWorker",
            assignedRoomName: spawn.room.name,
            mining: true
        };
    }
    return null;
}
