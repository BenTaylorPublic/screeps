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
        ensureTheRoomIsSetup(myRoom);
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
            myRoom.myCreeps.push({
                name: newCreep.name,
                role: newCreep.memory.role,
                assignedRoomName: myRoom.name
            });
            console.log("spawning new creep");
        }
    }
};
function ensureTheRoomIsSetup(myRoom) {
    //Check if containers are setup
    if (myRoom.myContainers.length <= myRoom.mySources.length) {
        //Containers aren't set up
        ensureTheCachesAreSetup(myRoom);
    }
    //TODO: Check if there's a bank
}
function ensureTheCachesAreSetup(myRoom) {
    const room = Game.rooms[myRoom.name];
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
            if (isNotWall(terrain, sourcePosX, sourcePosY + 1) &&
                isNotWall(terrain, sourcePosX, sourcePosY + 2)) { //TM
                placeSourceContainerCache(myRoom, mySource, sourcePosX, sourcePosY + 2);
            }
            else if (isNotWall(terrain, sourcePosX - 1, sourcePosY) &&
                isNotWall(terrain, sourcePosX - 2, sourcePosY)) { //ML
                placeSourceContainerCache(myRoom, mySource, sourcePosX - 2, sourcePosY);
            }
            else if (isNotWall(terrain, sourcePosX + 1, sourcePosY) &&
                isNotWall(terrain, sourcePosX + 2, sourcePosY)) { //MR
                placeSourceContainerCache(myRoom, mySource, sourcePosX + 2, sourcePosY);
            }
            else if (isNotWall(terrain, sourcePosX, sourcePosY - 1)
                && isNotWall(terrain, sourcePosX, sourcePosY - 2)) { //BM
                placeSourceContainerCache(myRoom, mySource, sourcePosX, sourcePosY - 2);
            }
            else {
                if (isNotWall(terrain, sourcePosX - 1, sourcePosY + 1)) { //TL
                    if (isNotWall(terrain, sourcePosX - 1, sourcePosY + 2)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 1, sourcePosY + 2);
                        continue;
                    }
                    else if (isNotWall(terrain, sourcePosX - 2, sourcePosY + 1)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 2, sourcePosY + 1);
                        continue;
                    }
                }
                if (isNotWall(terrain, sourcePosX + 1, sourcePosY + 1)) { //TR
                    if (isNotWall(terrain, sourcePosX + 1, sourcePosY + 2)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 1, sourcePosY + 2);
                        continue;
                    }
                    else if (isNotWall(terrain, sourcePosX + 2, sourcePosY + 1)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 2, sourcePosY + 1);
                        continue;
                    }
                }
                if (isNotWall(terrain, sourcePosX - 1, sourcePosY - 1)) { //BL
                    if (isNotWall(terrain, sourcePosX - 2, sourcePosY - 1)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 2, sourcePosY - 1);
                        continue;
                    }
                    else if (isNotWall(terrain, sourcePosX - 1, sourcePosY - 2)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX - 1, sourcePosY - 2);
                        continue;
                    }
                }
                if (isNotWall(terrain, sourcePosX + 1, sourcePosY - 1)) { //BR
                    if (isNotWall(terrain, sourcePosX + 1, sourcePosY - 2)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 1, sourcePosY - 2);
                        continue;
                    }
                    else if (isNotWall(terrain, sourcePosX + 2, sourcePosY - 1)) {
                        placeSourceContainerCache(myRoom, mySource, sourcePosX + 2, sourcePosY - 1);
                        continue;
                    }
                }
                console.error("Couldn't find a viable spot to place a container");
            }
        }
    }
}
function placeSourceContainerCache(myRoom, mySource, x, y) {
    //TODO: Code this
    console.log("Placing source container cache at " + x.toString() + ", " + y.toString());
    //room.createConstructionSite(x, y)
    //Set mySource.cacheContainerId
    //Set myContainer.assignedSourceId
}
function isNotWall(terrain, x, y) {
    return terrain.get(x, y) !== TERRAIN_MASK_WALL;
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
