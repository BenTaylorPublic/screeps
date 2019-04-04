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
        if (mySource.cachePos == null) {
            makeNewCache = true;
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
        const result = room.createConstructionSite(x, y, STRUCTURE_CONTAINER);
        if (result !== OK) {
            console.log("ERR: Placing source cache returned not OK");
            return false;
        }
        console.log("LOG: Placed source container cache at " + x.toString() + ", " + y.toString());
        mySource.cachePos = {
            roomName: myRoom.name,
            x: x,
            y: y
        };
        return true;
    }
    return false;
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
