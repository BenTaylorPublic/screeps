"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
const constants_1 = require("constants");
class RoomSpawnLaborer {
    static trySpawnLaborer(myRoom, laborerCount) {
        if (myRoom.bankPos == null) {
            //Only spawn laborers through this method if the bank is real
            return;
        }
        const bank = global_functions_1.GlobalFunctions.getBank(myRoom);
        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }
        if (bank.store[RESOURCE_ENERGY] >= constants_1.Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER &&
            laborerCount < constants_1.Constants.MAX_LABORERS) {
            //If the bank is capped, spawn another laborer
            const newCreep = this.spawnLaborer(myRoom);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
            }
        }
    }
    static forceSpawnLaborer(myRoom) {
        const newCreep = this.spawnLaborer(myRoom);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Force spawned a new Laborer");
        }
    }
    static spawnLaborer(myRoom) {
        let spawn;
        if (myRoom.spawns.length === 0 ||
            Game.spawns[myRoom.spawns[0].name] == null) {
            // A room needs a laborer, but it has no spawns yet
            // Going to use the nearest room's spawn instead
            spawn = global_functions_1.GlobalFunctions.findClosestSpawn(new RoomPosition(25, 25, myRoom.name));
            if (spawn == null) {
                console.log("ERR: Couldn't find any spawns to make a laborer for room " + myRoom.name);
                return null;
            }
        }
        else {
            spawn = Game.spawns[myRoom.spawns[0].name];
        }
        //Have a valid spawn now
        //Once the bank is setup, use the best body you can get
        const useBestBody = myRoom.roomStage >= 4;
        const body = global_functions_1.GlobalFunctions.generateBody([MOVE, MOVE, CARRY, WORK], [MOVE, MOVE, CARRY, WORK], spawn.room, useBestBody);
        const id = global_functions_1.GlobalFunctions.getId();
        const result = spawn.spawnCreep(body, "Creep" + id, {
            memory: {
                name: "Creep" + id,
                role: "Laborer",
                assignedRoomName: myRoom.name
            }
        });
        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "Laborer",
                assignedRoomName: myRoom.name,
                state: "Labor"
            };
        }
        return null;
    }
}
exports.RoomSpawnLaborer = RoomSpawnLaborer;
