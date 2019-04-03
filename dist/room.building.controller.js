"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomBuildingController = {
    run: function (myRoom) {
        ensureTheBuildingsAreSetup(myRoom);
    }
};
function ensureTheBuildingsAreSetup(myRoom) {
    if (myRoom.roomStage < 2.2) {
        return;
    }
    //TODO: Automate building tower
    if (myRoom.roomStage < 2.4) {
        return;
    }
    //Check if containers are setup
    ensureTheCachesAreSetup(myRoom);
    //TODO: Automate building container bank
    //TODO: Automate building extensions
}
function ensureTheCachesAreSetup(myRoom) {
    const room = Game.rooms[myRoom.name];
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        let makeNewCache = false;
        if (mySource.cacheContainerId == null) {
            makeNewCache = true;
        }
        else if (Game.getObjectById(mySource.cacheContainerId) == null) {
            makeNewCache = true;
            for (let j = myRoom.myContainers.length - 1; j >= 0; j--) {
                const myContainer = myRoom.myContainers[i];
                if (myContainer.id === mySource.cacheContainerId) {
                    myRoom.myContainers.splice(j, 1);
                }
            }
        }
        if (makeNewCache) {
            //No container cache
            const source = Game.getObjectById(mySource.id);
            if (source == null) {
                console.log("ERR: Couldn't get a source with ID " + mySource.id);
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
                console.log("ERR: Couldn't find a viable spot to place a container");
            }
        }
    }
}
function tryPlaceSourceContainerCache(myRoom, mySource, terrain, x, y) {
    if (isConstructable(terrain, myRoom.name, x, y)) {
        const room = Game.rooms[myRoom.name];
        const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        if (constructionSites.length === 1) {
            console.log("LOG: Found source container cache construction site at " + x.toString() + ", " + y.toString());
            //Something is already there
            //That means that it was placed in a previous tick, and now we can get the construction site ID
            const myContainer = {
                id: constructionSites[0].id,
                role: "SourceCache",
                assignedSourceId: mySource.id,
                haulerNames: []
            };
            mySource.cacheContainerId = myContainer.id;
            myRoom.myContainers.push(myContainer);
            return true;
        }
        else {
            const result = room.createConstructionSite(x, y, STRUCTURE_CONTAINER);
            if (result !== OK) {
                console.log("ERR: Placing source cache returned not OK");
                return false;
            }
            console.log("LOG: Placed source container cache at " + x.toString() + ", " + y.toString());
            return true;
        }
    }
    else {
        let foundExistingCache = false;
        const roomPos = new RoomPosition(x, y, myRoom.name);
        const structures = roomPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                foundExistingCache = true;
                mySource.cacheContainerId = structure.id;
                const myContainer = {
                    id: structure.id,
                    role: "SourceCache",
                    assignedSourceId: mySource.id,
                    haulerNames: []
                };
                myRoom.myContainers.push(myContainer);
                return true;
            }
        }
        return false;
    }
}
function isConstructable(terrain, roomName, x, y) {
    if (x < 0 || x > 49 || y < 0 || y > 49) {
        return false;
    }
    if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
        const roomPos = new RoomPosition(x, y, roomName);
        const structures = roomPos.lookFor(LOOK_STRUCTURES);
        if (structures.length !== 0) {
            return false;
        }
        else {
            return true;
        }
    }
    return false;
}
