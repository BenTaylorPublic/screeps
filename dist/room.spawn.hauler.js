"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
const constants_1 = require("constants");
class RoomSpawnHauler {
    static trySpawnHauler(myRoom) {
        if (myRoom.roomStage < 4) {
            //No need for haulers before the bank is setup
            return;
        }
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.haulerNames.length < constants_1.Constants.AMOUNT_OF_HAULERS_PER_SOURCE) {
                //Spawn a new hauler
                const newCreep = this.spawnHauler(myRoom, mySource);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    mySource.haulerNames.push(newCreep.name);
                    console.log("LOG: Spawned a new hauler");
                    return;
                }
            }
        }
    }
    static spawnHauler(myRoom, mySource) {
        if (myRoom.spawns.length === 0) {
            console.log("ERR: Attempted to spawn hauler in a room with no spawner (1)");
            return null;
        }
        const spawn = Game.spawns[myRoom.spawns[0].name];
        if (spawn == null) {
            console.log("ERR: Attempted to spawn hauler in a room with no spawner (2)");
            return null;
        }
        if (mySource.cache == null) {
            console.log("ERR: Attempted to spawn hauler for a source with no cache pos");
            return null;
        }
        //Have a valid spawn now
        const body = global_functions_1.GlobalFunctions.generateBody([MOVE, CARRY], [MOVE, CARRY], spawn.room, true);
        const id = global_functions_1.GlobalFunctions.getId();
        const result = spawn.spawnCreep(body, "Creep" + id, {
            memory: {
                name: "Creep" + id,
                role: "Hauler",
                assignedRoomName: spawn.room.name
            }
        });
        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "Hauler",
                assignedRoomName: spawn.room.name,
                cachePosToPickupFrom: mySource.cache.pos,
                pickup: true
            };
        }
        return null;
    }
}
exports.RoomSpawnHauler = RoomSpawnHauler;
