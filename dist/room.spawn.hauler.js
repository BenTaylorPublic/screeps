"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("global");
exports.roomSpawnHauler = {
    trySpawnHauler: function (myRoom) {
        if (myRoom.roomStage < 2.6) {
            return;
        }
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.haulerNames.length === 0 ||
                (myRoom.roomStage >= 3 && mySource.haulerNames.length < 2)) {
                //Spawn a new hauler
                const newCreep = spawnHauler(myRoom, mySource);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    mySource.haulerNames.push(newCreep.name);
                    console.log("LOG: Spawned a new hauler");
                    return;
                }
            }
        }
    }
};
function spawnHauler(myRoom, mySource) {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }
    if (mySource.cachePos == null) {
        console.log("ERR: Attempted to spawn hauler for a source with no cache pos");
        return null;
    }
    //Have a valid spawn now
    let body = [MOVE, CARRY];
    while (true) {
        if (global_1.global.calcBodyCost(body) + global_1.global.calcBodyCost([MOVE, CARRY]) < spawn.room.energyAvailable) {
            body = body.concat([MOVE, CARRY]);
        }
        else {
            break;
        }
    }
    const id = global_1.global.getId();
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
            cachePosToPickupFrom: mySource.cachePos,
            pickup: true
        };
    }
    return null;
}
