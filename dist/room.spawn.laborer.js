"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("global");
exports.roomSpawnLaborer = {
    trySpawnLaborer: function (myRoom) {
        if (myRoom.roomStage < 2.8) {
            return;
        }
        if (myRoom.bankPos == null) {
            console.log("ERR: Room's bank pos was null");
            return;
        }
        const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
        let bank = null;
        const structures = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                bank = structure;
                break;
            }
            else if (structure.structureType === STRUCTURE_STORAGE) {
                bank = structure;
                break;
            }
        }
        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }
        if (bank.store[RESOURCE_ENERGY] === bank.storeCapacity) {
            //If the bank is capped, spawn another laborer
            const newCreep = spawnLaborer(myRoom);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
            }
        }
    }
};
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
    let body = [MOVE, MOVE, CARRY, WORK];
    let breakLoop = false;
    while (!breakLoop) {
        if (global_1.global.calcBodyCost(body) + global_1.global.calcBodyCost([MOVE, MOVE, CARRY, WORK]) < spawn.room.energyCapacityAvailable) {
            body = body.concat([MOVE, MOVE, CARRY, WORK]);
        }
        else {
            breakLoop = true;
        }
    }
    const id = global_1.global.getId();
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
    return null;
}
