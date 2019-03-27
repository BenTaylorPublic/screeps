"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_basicworker_1 = require("role.basicworker");
exports.controllerLogic1 = {
    run: function (myRoom) {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + myRoom.name);
            return;
        }
        const room = Game.rooms[myRoom.name];
        //Can still see the room
        //Check if containers are setup
        if (myRoom.myContainers.length < myRoom.mySources.length) {
            //Containers aren't set up
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource = myRoom.mySources[i];
                if (mySource.cacheContainerId == null) {
                    //No container cache
                    const source = Game.getObjectById(mySource.id);
                    if (source == null) {
                        console.error("Couldn't get a source with ID " + mySource.id);
                        continue;
                    }
                    const sourcePosX = source.pos.x;
                    const sourcePosY = source.pos.y;
                    const terrain = room.getTerrain();
                    if (terrain.get(sourcePosX - 1, sourcePosY + 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 1, sourcePosY + 2);
                    }
                    else if (terrain.get(sourcePosX, sourcePosY + 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX, sourcePosY + 2);
                    }
                    else if (terrain.get(sourcePosX + 1, sourcePosY + 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 1, sourcePosY + 2);
                    }
                    else if (terrain.get(sourcePosX - 2, sourcePosY + 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 2, sourcePosY + 1);
                    }
                    else if (terrain.get(sourcePosX + 2, sourcePosY + 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 2, sourcePosY + 1);
                    }
                    else if (terrain.get(sourcePosX - 2, sourcePosY) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 2, sourcePosY);
                    }
                    else if (terrain.get(sourcePosX + 2, sourcePosY) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 2, sourcePosY);
                    }
                    else if (terrain.get(sourcePosX - 2, sourcePosY - 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 2, sourcePosY - 1);
                    }
                    else if (terrain.get(sourcePosX + 2, sourcePosY - 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 2, sourcePosY - 1);
                    }
                    else if (terrain.get(sourcePosX - 1, sourcePosY - 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 1, sourcePosY - 2);
                    }
                    else if (terrain.get(sourcePosX, sourcePosY - 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX, sourcePosY - 2);
                    }
                    else if (terrain.get(sourcePosX + 1, sourcePosY - 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 1, sourcePosY - 2);
                    }
                    else {
                        console.error("Couldn't find a viable spot to place a container");
                    }
                }
            }
        }
        //TODO: Check if there's a bank
        let creepCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep = myRoom.myCreeps[i];
            if (myCreep.role === "BasicWorker") {
                // Use the basicworker.role
                role_basicworker_1.roleBasicWorker.run(Game.creeps[myCreep.name]);
            }
            creepCount++;
        }
        if (creepCount < 6) {
            const newCreep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            role_basicworker_1.roleBasicWorker.run(newCreep);
        }
    }
};
function placeSourceContainerCache(myRoom, mySource, x, y) {
    //TODO: Code this
    // console.log("Placing source container cache at " + x.toString() + ", " + y.toString());
    //room.createConstructionSite(x, y)
    //Set mySource.cacheContainerId
    //Set myContainer.assignedSourceId
}
function spawnBasicWorker(spawn) {
    const id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { assignedRoomName: spawn.room.name, role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}
function getId() {
    const toReturn = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
