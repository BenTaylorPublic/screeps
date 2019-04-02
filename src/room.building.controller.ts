export const roomBuildingController: any = {
    run: function (myRoom: MyRoom) {
        ensureTheBuildingsAreSetup(myRoom);
    }
};

function ensureTheBuildingsAreSetup(myRoom: MyRoom): void {

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

function ensureTheCachesAreSetup(myRoom: MyRoom) {
    const room: Room = Game.rooms[myRoom.name];

    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        let makeNewCache: boolean = false;


        if (mySource.cacheContainerId == null) {
            makeNewCache = true;
        } else if (Game.getObjectById(mySource.cacheContainerId) == null) {
            makeNewCache = true;
            for (let j = myRoom.myContainers.length - 1; j >= 0; j--) {
                const myContainer: MyContainer = myRoom.myContainers[i];
                if (myContainer.id === mySource.cacheContainerId) {
                    myRoom.myContainers.splice(j, 1);
                }
            }
        }

        if (makeNewCache) {
            //No container cache
            const source: Source = Game.getObjectById<Source>(mySource.id) as Source;
            if (source == null) {
                console.log("Couldn't get a source with ID " + mySource.id);
                continue;
            }
            const sourcePosX: number = source.pos.x;
            const sourcePosY: number = source.pos.y;
            const terrain: RoomTerrain = room.getTerrain();

            if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX - 1, sourcePosY + 1)) { //TL
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX, sourcePosY + 1)) { //TM
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX + 1, sourcePosY + 1)) { //TR
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX - 1, sourcePosY)) { //ML
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX + 1, sourcePosY)) { //MR
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX - 1, sourcePosY - 1)) { //BL
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX, sourcePosY - 1)) { //BM
            } else if (tryPlaceSourceContainerCache(myRoom, mySource, terrain, sourcePosX + 1, sourcePosY - 1)) { //BR
            } else {
                console.log("Couldn't find a viable spot to place a container");
            }
        }

    }
}

function tryPlaceSourceContainerCache(myRoom: MyRoom, mySource: MySource, terrain: RoomTerrain, x: number, y: number): boolean {
    if (isConstructable(terrain, myRoom.name, x, y)) {

        const room: Room = Game.rooms[myRoom.name];

        const constructionSites: ConstructionSite<BuildableStructureConstant>[] = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        if (constructionSites.length === 1) {
            console.log("Found source container cache construction site at " + x.toString() + ", " + y.toString());
            //Something is already there
            //That means that it was placed in a previous tick, and now we can get the construction site ID
            const myContainer: MyContainer = {
                id: constructionSites[0].id,
                role: "SourceCache",
                assignedSourceId: mySource.id,
                haulerNames: []
            };
            mySource.cacheContainerId = myContainer.id;
            myRoom.myContainers.push(myContainer);
            return true;
        } else {
            const result: ScreepsReturnCode = room.createConstructionSite(x, y, STRUCTURE_CONTAINER);
            if (result !== OK) {
                console.log("Placing source cache returned not OK");
                return false;
            }
            console.log("Placed source container cache at " + x.toString() + ", " + y.toString());
            return true;
        }
    } else {
        let foundExistingCache: boolean = false;
        const roomPos: RoomPosition = new RoomPosition(x, y, myRoom.name);
        const structures: Structure<StructureConstant>[] = roomPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            const structure: Structure<StructureConstant> = structures[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                foundExistingCache = true;
                mySource.cacheContainerId = structure.id;
                const myContainer: MyContainer = {
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

function isConstructable(terrain: RoomTerrain, roomName: string, x: number, y: number): boolean {
    if (x < 0 || x > 49 || y < 0 || y > 49) {
        return false;
    }
    if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
        const roomPos: RoomPosition = new RoomPosition(x, y, roomName);
        const structures: Structure<StructureConstant>[] = roomPos.lookFor(LOOK_STRUCTURES);
        if (structures.length !== 0) {
            return false;
        } else {
            return true;
        }
    }

    return false;
}
