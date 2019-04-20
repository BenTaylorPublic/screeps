"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.liveSpawnLaborers = {
    run: function () {
        const flagNames = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-laborer") {
                continue;
            }
            if (flag.room == null) {
                console.log("ERR: Can't spawn a remote laborer if the flag's room is null");
                flag.remove();
                continue;
            }
            let myRoom = null;
            for (let j = 0; j < Memory.myMemory.myRooms.length; j++) {
                const possibleMyRoom = Memory.myMemory.myRooms[j];
                if (possibleMyRoom.name === flag.room.name) {
                    myRoom = possibleMyRoom;
                }
            }
            if (myRoom == null) {
                console.log("ERR: Can't spawn a remote laborer for a room not in MyRooms");
                flag.remove();
                continue;
            }
            const newCreep = spawnLaborer(flag.room);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Force spawned a new Laborer");
            }
            //Do not continue through the rest of the flags
            return;
        }
    }
};
function spawnLaborer(roomToGoTo) {
    const spawn = global_functions_1.globalFunctions.findClosestSpawn(new RoomPosition(25, 25, roomToGoTo.name));
    if (spawn == null) {
        console.log("ERR: Attempted to spawn laborer in a room with no spawner");
        return null;
    }
    //Have a valid spawn now
    //Once the bank is setup, use the best body you can get
    const body = global_functions_1.globalFunctions.generateBody([MOVE, MOVE, CARRY, WORK], [MOVE, MOVE, CARRY, WORK], spawn.room, false);
    const id = global_functions_1.globalFunctions.getId();
    const result = spawn.spawnCreep(body, "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: roomToGoTo.name
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: roomToGoTo.name,
            state: "Labor"
        };
    }
    return null;
}
