"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
const constants_1 = require("constants");
exports.roomSpawnLaborer = {
    trySpawnLaborer: function (myRoom, laborerCount) {
        if (myRoom.bankPos == null) {
            //Only spawn laborers through this method if the bank is real
            return;
        }
        const bank = global_functions_1.globalFunctions.getBank(myRoom);
        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }
        if (bank.store[RESOURCE_ENERGY] >= constants_1.Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER &&
            laborerCount < constants_1.Constants.MAX_LABORERS) {
            //If the bank is capped, spawn another laborer
            const newCreep = spawnLaborer(myRoom);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
            }
        }
    },
    forceSpawnLaborer: function (myRoom) {
        const newCreep = spawnLaborer(myRoom);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Force spawned a new Laborer");
        }
    }
};
function spawnLaborer(myRoom) {
    if (myRoom.spawns.length === 0) {
        console.log("ERR: Attempted to spawn laborer in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawns[0].name];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn laborer in a room with no spawner (2)");
        return null;
    }
    //Have a valid spawn now
    //Once the bank is setup, use the best body you can get
    const useBestBody = myRoom.roomStage >= 4;
    const body = global_functions_1.globalFunctions.generateBody([MOVE, MOVE, CARRY, WORK], [MOVE, MOVE, CARRY, WORK], spawn.room, useBestBody);
    const id = global_functions_1.globalFunctions.getId();
    const result = spawn.spawnCreep(body, "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name,
            state: "Labor"
        };
    }
    return null;
}
