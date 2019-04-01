import { roleMinerAndWorker } from "role.minerAndWorker";
import { towerController } from "towerController";
import { roleMiner } from "role.miner";
import { roleHauler } from "role.hauler";
import { controllerRoomStages } from "controller.roomStages";


export const controllerLogic1: any = {
    run: function (myRoom: MyRoom) {

        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room

        const room: Room = Game.rooms[myRoom.name];

        controllerRoomStages.run(myRoom);

        ensureTheBuildingsAreSetup(myRoom);
        ensureMinersArePlaced(myRoom);
        ensureHaulersArePlaced(myRoom);

        //Tower logic
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        towers.forEach(towerController.run);

        //MinerAndWorker logic
        let minerAndWorkerCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "MinerAndWorker") {
                roleMinerAndWorker.run(myCreep);
                minerAndWorkerCount++;
            } else if (myCreep.role === "Miner") {
                roleMiner.run(myCreep);
            } else if (myCreep.role === "Hauler") {
                roleHauler.run(myCreep);
            }
        }
        if (minerAndWorkerCount < 6) {
            const newCreep: MinerAndWorker | null = spawnMinerAndWorker(myRoom.spawnName);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("spawned a new creep");
            } else {
                console.log("failed to spawn new creep");
            }
        }
    }
};

function ensureTheBuildingsAreSetup(myRoom: MyRoom): void {

    if (myRoom.roomStage === 0.5 &&
        myRoom.manuallyPlacedBase === false) {
        //Room needs a spawn
        if (myRoom.baseCenter == null) {

            findBaseCenter(myRoom);
            if (myRoom.baseCenter == null) {
                console.log("Couldn't find a base center");
                return;
            }
        }
        ensureSpawnIsSetup(myRoom);
        return;
    }



    if (myRoom.roomStage < 2.2) {
        return;
    }

    //TODO: Automate building tower


    if (myRoom.roomStage < 2.4) {
        return;
    }

    //Check if containers are setup
    if (myRoom.myContainers.length <= myRoom.mySources.length) {
        //Containers aren't set up
        ensureTheCachesAreSetup(myRoom);
        //TODO: Automate building container bank
    }

    //TODO: Automate building extensions
}

function ensureTheCachesAreSetup(myRoom: MyRoom) {
    const room: Room = Game.rooms[myRoom.name];

    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.cacheContainerId == null) {
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
    if (isNotWall(terrain, x, y)) {

        const room: Room = Game.rooms[myRoom.name];

        const constructionSites: ConstructionSite<BuildableStructureConstant>[] = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        if (constructionSites.length === 1) {
            console.log("Found source container cache at " + x.toString() + ", " + y.toString());
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
        return false;
    }

}

function isNotWall(terrain: RoomTerrain, x: number, y: number): boolean {
    if (x < 0 || x > 49 || y < 0 || y > 49) {
        return false;
    }
    return terrain.get(x, y) !== TERRAIN_MASK_WALL;
}

function spawnMinerAndWorker(spawnName: string | null): MinerAndWorker | null {
    if (spawnName == null) {
        return null; //spawn name not set
    }
    const spawn: StructureSpawn = Game.spawns[spawnName];
    const id = getId();
    if (spawn.spawnCreep(
        [MOVE, MOVE, CARRY, WORK],
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
    if (myRoom.roomStage < 2.6) {
        return;
    }

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
        // console.log("attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        // console.log("attempted to spawn miner in a room with no spawner (2)");
        return null;
    }

    if (mySource.cacheContainerId == null) {
        // console.log("attempted to spawn miner to a source with no cache container id");
        return null;
    }

    //Have a valid spawn now
    const id = getId();
    const result: ScreepsReturnCode =
        spawn.spawnCreep(
            [MOVE, WORK, WORK, WORK, WORK, WORK],
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
            }
        );

    if (result === OK) {
        mySource.minerName = "Creep" + id;
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

function ensureHaulersArePlaced(myRoom: MyRoom): void {

    if (myRoom.roomStage < 2.6) {
        return;
    }

    for (let i = 0; i < myRoom.myContainers.length; i++) {
        const myContainer: MyContainer = myRoom.myContainers[i];
        if (myContainer.role === "SourceCache") {
            if (myContainer.haulerNames != null &&
                myContainer.haulerNames.length === 0) {
                //Spawn a new hauler
                spawnHauler(myRoom, myContainer);
            }
        }
    }
}

function spawnHauler(myRoom: MyRoom, myContainer: MyContainer): Hauler | null {
    if (myRoom.spawnName == null) {
        // console.log("attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        // console.log("attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }

    //Have a valid spawn now
    const body: BodyPartConstant[] = [MOVE];
    let addCarry: boolean = true;
    let breakLoop: boolean = false;
    while (!breakLoop) {
        if (addCarry) {
            addCarry = false;
            if (calcBodyCost(body) + calcBodyCost([CARRY]) < spawn.room.energyCapacityAvailable) {
                body.concat([CARRY]);
            } else {
                breakLoop = true;
            }
        } else {
            addCarry = true;
            if (calcBodyCost(body) + calcBodyCost([MOVE]) < spawn.room.energyCapacityAvailable) {
                body.concat([MOVE]);
            } else {
                breakLoop = true;
            }
        }
    }

    let bankId: string = "";
    for (let i = 0; i < myRoom.myContainers.length; i++) {
        if (myRoom.myContainers[i].role === "Bank") {
            bankId = myRoom.myContainers[i].id;
        }
    }

    if (bankId === "") {
        console.log("Not spawning a hauler because the room bas no bank");
        return null;
    }

    const id = getId();
    const result: ScreepsReturnCode =
        spawn.spawnCreep(
            body,
            "Creep" + id,
            {
                memory:
                {
                    name: "Creep" + id,
                    role: "Hauler",
                    assignedRoomName: spawn.room.name,
                    cacheContainerIdToGrabFrom: myContainer.id,
                    bankContainerIdToPutIn: bankId,
                    pickup: true
                }
            }
        );

    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name,
            cacheContainerIdToGrabFrom: myContainer.id,
            bankContainerIdToPutIn: bankId,
            pickup: true
        };
    }
    return null;
}

function calcBodyCost(body: BodyPartConstant[]): number {
    return body.reduce(function (cost: number, part: BodyPartConstant) {
        return cost + BODYPART_COST[part];
    }, 0);
}


function findBaseCenter(myRoom: MyRoom): void {
    console.log("Finding a base center");
    const room: Room = Game.rooms[myRoom.name];
    const options: RoomPosition[] = [];
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            const newRoomPos: RoomPosition = new RoomPosition(x, y, myRoom.name);
            if (checkIfValidBaseCenter(newRoomPos)) {
                options.push(newRoomPos);
            }
        }
    }

    if (options.length === 0) {
        return;
    }

    let bestManhattanDistance: number = 50;
    let bestOption: RoomPosition | null = null;

    for (let i = 0; i < options.length; i++) {
        const potentialLocation: RoomPosition = options[i];
        const manhattanDistance: number = Math.abs(25 - potentialLocation.x) + Math.abs(25 - potentialLocation.y);
        if (manhattanDistance < bestManhattanDistance) {
            bestOption = potentialLocation;
            bestManhattanDistance = manhattanDistance;
        }
    }

    if (bestOption == null) {
        return;
    }

    console.log("Setting a rooms base location to " + bestOption.x + ", " + bestOption.y);
    //TODO: Set it

}

function checkIfValidBaseCenter(roomPos: RoomPosition): boolean {
    const x: number = roomPos.x;
    const y: number = roomPos.y;
    const roomName: string = roomPos.roomName;
    const terrain: RoomTerrain = Game.rooms[roomName].getTerrain();
    if (isConstructable(terrain, roomName, x - 1, y - 3) &&
        isConstructable(terrain, roomName, x, y - 3) &&
        isConstructable(terrain, roomName, x + 1, y - 3) &&
        isConstructable(terrain, roomName, x - 3, y - 2) &&
        isConstructable(terrain, roomName, x - 2, y - 2) &&
        isConstructable(terrain, roomName, x - 1, y - 2) &&
        isConstructable(terrain, roomName, x, y - 2) &&
        isConstructable(terrain, roomName, x + 1, y - 2) &&
        isConstructable(terrain, roomName, x + 2, y - 2) &&
        isConstructable(terrain, roomName, x + 3, y - 2) &&
        isConstructable(terrain, roomName, x - 4, y - 1) &&
        isConstructable(terrain, roomName, x - 3, y - 1) &&
        isConstructable(terrain, roomName, x - 2, y - 1) &&
        isConstructable(terrain, roomName, x - 1, y - 1) &&
        isConstructable(terrain, roomName, x, y - 1) &&
        isConstructable(terrain, roomName, x + 1, y - 1) &&
        isConstructable(terrain, roomName, x + 2, y - 1) &&
        isConstructable(terrain, roomName, x + 3, y - 1) &&
        isConstructable(terrain, roomName, x + 4, y - 1) &&
        isConstructable(terrain, roomName, x - 4, y) &&
        isConstructable(terrain, roomName, x - 3, y) &&
        isConstructable(terrain, roomName, x - 2, y) &&
        isConstructable(terrain, roomName, x - 1, y) &&
        isConstructable(terrain, roomName, x, y) &&
        isConstructable(terrain, roomName, x + 1, y) &&
        isConstructable(terrain, roomName, x + 2, y) &&
        isConstructable(terrain, roomName, x + 3, y) &&
        isConstructable(terrain, roomName, x + 4, y) &&
        isConstructable(terrain, roomName, x - 1, y + 3) &&
        isConstructable(terrain, roomName, x, y + 3) &&
        isConstructable(terrain, roomName, x + 1, y + 3) &&
        isConstructable(terrain, roomName, x - 3, y + 2) &&
        isConstructable(terrain, roomName, x - 2, y + 2) &&
        isConstructable(terrain, roomName, x - 1, y + 2) &&
        isConstructable(terrain, roomName, x, y + 2) &&
        isConstructable(terrain, roomName, x + 1, y + 2) &&
        isConstructable(terrain, roomName, x + 2, y + 2) &&
        isConstructable(terrain, roomName, x + 3, y + 2) &&
        isConstructable(terrain, roomName, x - 4, y + 1) &&
        isConstructable(terrain, roomName, x - 3, y + 1) &&
        isConstructable(terrain, roomName, x - 2, y + 1) &&
        isConstructable(terrain, roomName, x - 1, y + 1) &&
        isConstructable(terrain, roomName, x, y + 1) &&
        isConstructable(terrain, roomName, x + 1, y + 1) &&
        isConstructable(terrain, roomName, x + 2, y + 1) &&
        isConstructable(terrain, roomName, x + 3, y + 1) &&
        isConstructable(terrain, roomName, x + 4, y + 1)
    ) {
        return true;
    }
    return false;
}

function isConstructable(terrain: RoomTerrain, roomName: string, x: number, y: number): boolean {
    if (isNotWall(terrain, x, y)) {
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

function ensureSpawnIsSetup(myRoom: MyRoom): void {
    //TODO: do it
}
