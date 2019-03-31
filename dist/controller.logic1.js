"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_minerAndWorker_1 = require("role.minerAndWorker");
const towerController_1 = require("towerController");
const role_miner_1 = require("role.miner");
const role_hauler_1 = require("role.hauler");
const controller_roomStages_1 = require("controller.roomStages");
exports.controllerLogic1 = {
    run: function (myRoom) {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room
        const room = Game.rooms[myRoom.name];
        controller_roomStages_1.controllerRoomStages.run(myRoom);
        ensureTheBuildingsAreSetup(myRoom);
        //TODO: Uncomment when you want to spawn miners and haulers (once caches and bank are placed)
        ensureMinersArePlaced(myRoom);
        ensureHaulersArePlaced(myRoom);
        //Tower logic
        const towers = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        towers.forEach(towerController_1.towerController.run);
        //MinerAndWorker logic
        let minerAndWorkerCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep = myRoom.myCreeps[i];
            if (myCreep.role === "MinerAndWorker") {
                role_minerAndWorker_1.roleMinerAndWorker.run(myCreep);
                minerAndWorkerCount++;
            }
            else if (myCreep.role === "Miner") {
                role_miner_1.roleMiner.run(myCreep);
            }
            else if (myCreep.role === "Hauler") {
                role_hauler_1.roleHauler.run(myCreep);
            }
        }
        if (minerAndWorkerCount < 6) {
            const newCreep = spawnMinerAndWorker(myRoom.spawnName);
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
function ensureTheBuildingsAreSetup(myRoom) {
    if (myRoom.roomStage === 0.5 &&
        myRoom.manuallyPlacedBase === false) {
        //Room needs a spawn
        if (myRoom.baseCenter == null) {
            findBaseCenter(myRoom);
            if (myRoom.baseCenter == null) {
                console.log("Couldn't find a base center");
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
    }
    //TODO: Automate building bank
    //TODO: Automate building extensions
}
function ensureTheCachesAreSetup(myRoom) {
    const room = Game.rooms[myRoom.name];
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.cacheContainerId == null) {
            //No container cache
            const source = Game.getObjectById(mySource.id);
            if (source == null) {
                console.log("Couldn't get a source with ID " + mySource.id);
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
                console.log("Couldn't find a viable spot to place a container");
            }
        }
    }
}
function tryPlaceSourceContainerCache(myRoom, mySource, terrain, x, y) {
    if (isNotWall(terrain, x, y)) {
        const room = Game.rooms[myRoom.name];
        const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        if (constructionSites.length === 1) {
            console.log("Found source container cache at " + x.toString() + ", " + y.toString());
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
                console.log("Placing source cache returned not OK");
                return false;
            }
            console.log("Placed source container cache at " + x.toString() + ", " + y.toString());
            return true;
        }
    }
    else {
        return false;
    }
}
function isNotWall(terrain, x, y) {
    return terrain.get(x, y) !== TERRAIN_MASK_WALL;
}
function spawnMinerAndWorker(spawnName) {
    if (spawnName == null) {
        return null; //spawn name not set
    }
    const spawn = Game.spawns[spawnName];
    const id = getId();
    if (spawn.spawnCreep([MOVE, MOVE, CARRY, WORK], "Creep" + id, {
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
function ensureMinersArePlaced(myRoom) {
    if (myRoom.roomStage < 2.6) {
        return;
    }
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.minerName == null) {
            //Needs a new miner
            spawnMiner(myRoom, mySource);
        }
    }
}
function getId() {
    const toReturn = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
function spawnMiner(myRoom, mySource) {
    if (myRoom.spawnName == null) {
        // console.log("attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
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
    const result = spawn.spawnCreep([MOVE, WORK, WORK, WORK, WORK, WORK], "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Miner",
            assignedRoomName: spawn.room.name,
            cacheContainerIdToPutIn: mySource.cacheContainerId,
            sourceId: mySource.id
        }
    });
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
function ensureHaulersArePlaced(myRoom) {
    if (myRoom.roomStage < 2.6) {
        return;
    }
    for (let i = 0; i < myRoom.myContainers.length; i++) {
        const myContainer = myRoom.myContainers[i];
        if (myContainer.role === "SourceCache") {
            if (myContainer.haulerNames != null &&
                myContainer.haulerNames.length === 0) {
                //Spawn a new hauler
                spawnHauler(myRoom, myContainer);
            }
        }
    }
}
function spawnHauler(myRoom, myContainer) {
    if (myRoom.spawnName == null) {
        // console.log("attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        // console.log("attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }
    //Have a valid spawn now
    const body = [MOVE];
    let addCarry = true;
    while (true) {
        if (addCarry) {
            addCarry = false;
            if (calcBodyCost(body) + calcBodyCost([CARRY]) < spawn.room.energyCapacityAvailable) {
                body.concat([CARRY]);
            }
            else {
                break;
            }
        }
        else {
            addCarry = true;
            if (calcBodyCost(body) + calcBodyCost([MOVE]) < spawn.room.energyCapacityAvailable) {
                body.concat([MOVE]);
            }
            else {
                break;
            }
        }
    }
    let bankId = "";
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
    const result = spawn.spawnCreep(body, "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name,
            cacheContainerIdToGrabFrom: myContainer.id,
            bankContainerIdToPutIn: bankId,
            pickup: true
        }
    });
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
function calcBodyCost(body) {
    return body.reduce(function (cost, part) {
        return cost + BODYPART_COST[part];
    }, 0);
}
function findBaseCenter(myRoom) {
    const room = Game.rooms[myRoom.name];
    const terrain = room.getTerrain();
    const valid = checkIfValidBaseCenter(terrain, 25, 25);
    const options = [];
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if (checkIfValidBaseCenter(terrain, x, y)) {
                const newRoomPos = new RoomPosition(x, y, myRoom.name);
                options.push(newRoomPos);
            }
        }
    }
    //TODO: Weight up options using manhattan distance
}
function checkIfValidBaseCenter(terrain, x, y) {
    //TODO: Check if it's all non walls or other buildings
    return false;
}
function ensureSpawnIsSetup(myRoom) {
    //TODO: do it
}
