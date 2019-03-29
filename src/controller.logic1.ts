import { roleMinerAndWorker } from "role.minerAndWorker";

export const controllerLogic1: any = {
    run: function (myRoom: MyRoom) {

        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + myRoom.name);
            return;
        }

        const room: Room = Game.rooms[myRoom.name];
        //Can still see the room
        ensureTheRoomIsSetup(myRoom);
        ensureMinersArePlaced(myRoom);

        //MinerAndWorker logic
        let creepCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "MinerAndWorker") {
                roleMinerAndWorker.run(myCreep);
            }
            creepCount++;
        }
        if (creepCount < 6) {
            const newCreep: MinerAndWorker | null = spawnMinerAndWorker(Game.spawns.Spawn1);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("spawned a new creep");
            } else {
                console.log("failed to spawn new creep");
            }
        }
    }
};

function ensureTheRoomIsSetup(myRoom: MyRoom): void {
    //Check if containers are setup
    if (myRoom.myContainers.length <= myRoom.mySources.length) {
        //Containers aren't set up
        ensureTheCachesAreSetup(myRoom);
    }

    //TODO: Check if there's a bank
}

function ensureTheCachesAreSetup(myRoom: MyRoom) {
    const room: Room = Game.rooms[myRoom.name];

    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.cacheContainerId == null) {
            //No container cache
            const source: Source = Game.getObjectById<Source>(mySource.id) as Source;
            if (source == null) {
                console.error("Couldn't get a source with ID " + mySource.id);
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
                console.error("Couldn't find a viable spot to place a container");
            }

        }
    }
}

function tryPlaceSourceContainerCache(myRoom: MyRoom, mySource: MySource, terrain: RoomTerrain, x: number, y: number): boolean {
    //TODO: Code this
    if (isNotWall(terrain, x, y)) {
        // console.log("Placing source container cache at " + x.toString() + ", " + y.toString());
        //room.createConstructionSite(x, y)
        //Set mySource.cacheContainerId
        //Set myContainer.assignedSourceId
        return true;
    } else {
        return false;
    }

}

function isNotWall(terrain: RoomTerrain, x: number, y: number): boolean {
    return terrain.get(x, y) !== TERRAIN_MASK_WALL;
}

function spawnMinerAndWorker(spawn: StructureSpawn): MinerAndWorker | null {
    const id = getId();
    if (spawn.spawnCreep(
        [MOVE, CARRY, WORK],
        "Creep" + id,
        {
            memory:
            {
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

function ensureMinersArePlaced(myRoom: MyRoom): void {
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.minerName == null) {
            //Needs a new miner
            spawnMiner(myRoom, mySource);
        }
    }
}

function getId(): number {
    const toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}

function spawnMiner(myRoom: MyRoom, mySource: MySource): Miner | null {

    if (myRoom.spawnName == null) {
        console.error("attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        console.error("attempted to spawn miner in a room with no spawner (2)");
        return null;
    }

    if (mySource.cacheContainerId == null) {
        console.error("attempted to spawn miner to a source with no cache container id");
        return null;
    }

    if (true) { //TODO: Remove this when you want to spawn miners
        console.log("Logic wants to spawn a miner for source ID " + mySource.id);
        return null;
    }

    //Have a valid spawn now
    const id = getId();
    if (spawn.spawnCreep(
        [MOVE, CARRY, WORK],
        "Creep" + id,
        {
            memory:
            {
                name: "Creep" + id,
                role: "Miner",
                assignedRoomName: spawn.room.name,
                cacheContainerIdToPutIn: mySource.cacheContainerId,
                sourceId: mySource.id
            }
        }) === OK) {
        return {
            name: "Creep" + id,
            role: "Miner",
            assignedRoomName: spawn.room.name,
            cacheContainerIdToPutIn: mySource.cacheContainerId,
            sourceId: mySource.id
        };
    }

    return null;
}
