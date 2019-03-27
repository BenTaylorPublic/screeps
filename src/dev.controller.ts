export const devController: any = {
    run: function (myRoom: RoomWithAssignedData) {

        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + myRoom.name);
            for (let i = 0; i < Memory.myMemory.rooms.length; i++) {
                if (Memory.myMemory.rooms[i].name === myRoom.name) {
                    delete Memory.myMemory.rooms[i];
                    return;
                }
            }
            console.log("Couldn't delete the room reference from myMemory");
            return;
        }

        const room: Room = Game.rooms[myRoom.name];

        //Can still see the room
        //Check if containers are setup
        if (myRoom.containers.length < myRoom.sources.length) {
            //Containers aren't set up
            for (let i = 0; i < myRoom.sources.length; i++) {
                const sourceId: string = myRoom.sources[i];
                let sourceHasContainerCache: boolean = false;
                for (let j = 0; j < myRoom.containers.length; j++) {
                    const container: ContainerWithAssignedData = myRoom.containers[j];
                    if (container.role === 0 && container.assignedSource === sourceId) {
                        sourceHasContainerCache = true;
                        break; //Break this innerloop
                    }
                }
                if (!sourceHasContainerCache) {
                    //No container cache
                    const source: Source = Game.getObjectById<Source>(sourceId) as Source;
                    if (source == null) {
                        console.error("Couldn't get a source with ID " + sourceId);
                        continue;
                    }
                    const sourcePosX: number = source.pos.x;
                    const sourcePosY: number = source.pos.y;
                    const terrain: RoomTerrain = room.getTerrain();
                    if (terrain.get(sourcePosX - 1, sourcePosY + 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX - 1, sourcePosY + 2);
                    } else if (terrain.get(sourcePosX, sourcePosY + 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX, sourcePosY + 2);
                    } else if (terrain.get(sourcePosX + 1, sourcePosY + 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX + 1, sourcePosY + 2);
                    } else if (terrain.get(sourcePosX - 2, sourcePosY + 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX - 2, sourcePosY + 1);
                    } else if (terrain.get(sourcePosX + 2, sourcePosY + 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX + 2, sourcePosY + 1);
                    } else if (terrain.get(sourcePosX - 2, sourcePosY) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX - 2, sourcePosY);
                    } else if (terrain.get(sourcePosX + 2, sourcePosY) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX + 2, sourcePosY);
                    } else if (terrain.get(sourcePosX - 2, sourcePosY - 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX - 2, sourcePosY - 1);
                    } else if (terrain.get(sourcePosX + 2, sourcePosY - 1) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX + 2, sourcePosY - 1);
                    } else if (terrain.get(sourcePosX - 1, sourcePosY - 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX - 1, sourcePosY - 2);
                    } else if (terrain.get(sourcePosX, sourcePosY - 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX, sourcePosY - 2);
                    } else if (terrain.get(sourcePosX + 1, sourcePosY - 2) !== TERRAIN_MASK_WALL) {
                        placeSourceContainerCache(myRoom, sourceId, sourcePosX + 1, sourcePosY - 2);
                    } else {
                        console.error("Couldn't find a viable spot to place a container");
                    }
                }
            }
        }
    }
};

function placeSourceContainerCache(myRoom: RoomWithAssignedData, sourceId: string, x: number, y: number): void {
    //TODO: Code this
    //room.createConstructionSite(x, y)
}
