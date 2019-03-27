export const stage2Controller: any = {
    run: function (room: RoomWithAssignedData) {
        if (Game.rooms[room.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + room.name);
            for (let i = 0; i < Memory.myMemory.rooms.length; i++) {
                if (Memory.myMemory.rooms[i].name === room.name) {
                    delete Memory.myMemory.rooms[i];
                    return;
                }
            }
            console.log("Couldn't delete the room reference from myMemory")
            return;
        }
        //Can still see the room
        //Check if containers are setup
        if (room.containers.length < room.sources.length) {
            //Containers aren't set up
            //TODO:
            /*
            If a source has no assigned containers
            Build one, 2 blocks away
            Using room.getTerrain().get(x,y)
            Make sure it's not TERRAIN_MASK_WALL
            Has to be in one of these:
            x - 1, y + 2
            x    , y + 2
            x + 1, y + 2
            x - 2, y + 1
            x + 2, y + 1
            x - 2, y
            x + 2, y
            x - 2, y - 1
            x + 2, y - 1
            x - 1, y - 2
            x    , y - 2
            x + 1, y - 2
            If all of them are walls, throw an error, because the source shouldn't be accessible
            Otherwise, add it to the room, and create a construction site (room.createConstructionSite(x, y, ))
            */
        }
    }
};
