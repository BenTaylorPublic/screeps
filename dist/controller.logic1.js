"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_minerAndWorker_1 = require("role.minerAndWorker");
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
        //MinerAndWorker logic
        let creepCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep = myRoom.myCreeps[i];
            if (myCreep.role === "MinerAndWorker") {
                role_minerAndWorker_1.roleMinerAndWorker.run(myCreep);
            }
            creepCount++;
        }
        if (creepCount < 6) {
            const newCreep = spawnMinerAndWorker(Game.spawns.Spawn1);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("spawned a new creep");
            }
            else {
                console.log("failed to spawn new creep");
            }
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
            if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX - 1, sourcePosY + 1)) { //TL
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX, sourcePosY + 1)) { //TM
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX + 1, sourcePosY + 1)) { //TR
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX - 1, sourcePosY)) { //ML
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX + 1, sourcePosY)) { //MR
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX - 1, sourcePosY - 1)) { //BL
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX, sourcePosY - 1)) { //BM
            }
            else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX + 1, sourcePosY - 1)) { //BR
            }
            else {
                console.error("Couldn't find a viable spot to place a container");
            }
        }
    }
}
function tryPlaceSourceContainerCache(myRoom, mySource, terrain, x, y) {
    //TODO: Code this
    if (isNotWall(terrain, x, y)) {
        // console.log("Placing source container cache at " + x.toString() + ", " + y.toString());
        //room.createConstructionSite(x, y)
        //Set mySource.cacheContainerId
        //Set myContainer.assignedSourceId
        return true;
    }
    else {
        return false;
    }
}
function isNotWall(terrain, x, y) {
    return terrain.get(x, y) !== TERRAIN_MASK_WALL;
}
function spawnMinerAndWorker(spawn) {
    const id = getId();
    if (spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, {
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
function getId() {
    const toReturn = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
