import { roleMinerAndWorker } from "role.minerAndWorker";
import { towerController } from "towerController";
import { roleMiner } from "role.miner";
import { roleHauler } from "role.hauler";


export const controllerLogic1: any = {
    run: function (myRoom: MyRoom) {

        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room

        const room: Room = Game.rooms[myRoom.name];

        checkRoomStage(myRoom);

        ensureTheBuildingsAreSetup(myRoom);
        //TODO: Uncomment when you want to spawn miners and haulers (once caches and bank are placed)
        // ensureMinersArePlaced(myRoom);
        // ensureHaulersArePlaced(myRoom);

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

function ensureTheBuildingsAreSetup(myRoom: MyRoom): void {
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
                role: 0,
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
    for (let i = 0; i < myRoom.myContainers.length; i++) {
        const myContainer: MyContainer = myRoom.myContainers[i];
        if (myContainer.role === 0) { //Source cache
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
    while (true) {
        if (addCarry) {
            addCarry = false;
            if (calcBodyCost(body) + calcBodyCost([CARRY]) < spawn.room.energyCapacityAvailable) {
                body.concat([CARRY]);
            } else {
                break;
            }
        } else {
            addCarry = true;
            if (calcBodyCost(body) + calcBodyCost([MOVE]) < spawn.room.energyCapacityAvailable) {
                body.concat([MOVE]);
            } else {
                break;
            }
        }
    }

    let bankId: string = "";
    for (let i = 0; i < myRoom.myContainers.length; i++) {
        if (myRoom.myContainers[i].role === 1) { //Bank
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


function checkRoomStage(myRoom: MyRoom): void {
    const room: Room = Game.rooms[myRoom.name];

    /*
        Loosely based on RCL
        -1: No controller
        0: RCL 0
        1: RCL 1, fixed amount of MinerAndWorkers
        1.2: RCL 2, Using MinerAndWorker creeps to build source caches and bank
        1.4: Creating Miners and haulers
        1.6: Miners and haulers are fully assigned
        2: Start spawning builders when bank hits cap, only spawn MinerAndWorker on panic mode
        2.5: RCL 3, Start constructing tower
        3: Tower complete, Haulers place road when they walk
        TODO: Define more stages
     */

    if (room.controller == null ||
        room.controller.my === false) {
        //Room has no controller, or is not my room
        myRoom.roomStage = -1;
        return; //Do not continue
    }

    if (myRoom.roomStage === 0) {
        //From 0 -> 1, the room must have a RCL 1
        if (room.controller.level === 1) {
            myRoom.roomStage = 1;
            console.log("Room " + myRoom.name + " advanced to room stage 1");
        }
    }

    if (myRoom.roomStage === 1) {
        if (room.controller.level === 2) {
            myRoom.roomStage = 1.2;
            console.log("Room " + myRoom.name + " advanced to room stage 1.2");
        }
    }

    if (myRoom.roomStage === 1.2) {
        const containers: StructureContainer[] = room.find<StructureContainer>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_CONTAINER;
            }
        });

        if (containers.length === room.find(FIND_SOURCES_ACTIVE).length + 1) {
            //Caches and bank must be built
            myRoom.roomStage = 1.4;
            console.log("Room " + myRoom.name + " advanced to room stage 1.4");
        }
    }

    if (myRoom.roomStage === 1.4) {
        let haulerAmount: number = 0;
        let minerAmount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Hauler") {
                haulerAmount++;
            } else if (myCreep.role === "Miner") {
                minerAmount++;
            }
        }
        const amountOfSources: number = room.find(FIND_SOURCES_ACTIVE).length;
        if (haulerAmount === amountOfSources &&
            minerAmount === amountOfSources) {
            myRoom.roomStage = 1.6;
            console.log("Room " + myRoom.name + " advanced to room stage 1.6");
        }
    }

    if (myRoom.roomStage === 1.6) {
        let myBankContainer: MyContainer | null = null;

        for (let i = 0; i < myRoom.myContainers.length; i++) {
            const myContainer = myRoom.myContainers[i];
            if (myContainer.role === 1) { //Bank
                myBankContainer = myContainer;
            }
        }

        if (myBankContainer != null) {
            const bankContainer: StructureContainer | null =
                Game.getObjectById<StructureContainer>(myBankContainer.id);
            if (bankContainer != null) {
                if (bankContainer.store[RESOURCE_ENERGY] === bankContainer.storeCapacity) {
                    //Bank is full
                    myRoom.roomStage = 2;
                    console.log("Room " + myRoom.name + " advanced to room stage 2");
                }
            }
        }
    }

    if (myRoom.roomStage === 2) {
        if (room.controller.level === 3) {
            myRoom.roomStage = 2.5;
            console.log("Room " + myRoom.name + " advanced to room stage 2.5");
        }
    }

    if (myRoom.roomStage === 2.5) {

        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_TOWER;
            }
        });

        if (towers.length === 1) {
            //Tower has been built
            myRoom.roomStage = 3;
            console.log("Room " + myRoom.name + " advanced to room stage 3");
        }
    }
}
