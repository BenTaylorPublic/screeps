"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomSpawningController = {
    run: function (myRoom) {
        let minerAndWorkerCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "MinerAndWorker") {
                minerAndWorkerCount++;
            }
        }
        //Force spawn a miner and worker if there are no creeps alive
        const forceSpawnMinerAndWorkers = myRoom.myCreeps.length === 0;
        if (forceSpawnMinerAndWorkers ||
            (minerAndWorkerCount < 6 && myRoom.roomStage < 3)) {
            const newCreep = spawnMinerAndWorker(myRoom.spawnName);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new MinerAndWorker");
            }
        }
        else {
            ensureLaborersSpawnIfNeeded(myRoom);
            ensureMinersArePlaced(myRoom);
            ensureHaulersArePlaced(myRoom);
        }
    }
};
function ensureMinersArePlaced(myRoom) {
    if (myRoom.roomStage < 2.6) {
        return;
    }
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.minerName == null) {
            //Needs a new miner
            const newCreep = spawnMiner(myRoom, mySource);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Miner");
            }
        }
    }
}
function spawnLaborer(myRoom) {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (2)");
        return null;
    }
    //Have a valid spawn now
    let body = [MOVE, MOVE, CARRY, WORK];
    let breakLoop = false;
    while (!breakLoop) {
        if (calcBodyCost(body) + calcBodyCost([MOVE, MOVE, CARRY, WORK]) < spawn.room.energyCapacityAvailable) {
            body = body.concat([MOVE, MOVE, CARRY, WORK]);
        }
        else {
            breakLoop = true;
        }
    }
    const id = getId();
    const result = spawn.spawnCreep(body, "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name,
            pickup: true
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name,
            pickup: true
        };
    }
    return null;
}
function spawnMiner(myRoom, mySource) {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (2)");
        return null;
    }
    if (mySource.cacheContainerId == null) {
        console.log("ERR: Attempted to spawn miner to a source with no cache container id");
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
function getId() {
    const toReturn = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
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
                const newCreep = spawnHauler(myRoom, myContainer);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    myContainer.haulerNames.push(newCreep.name);
                    console.log("LOG: Spawned a new hauler");
                }
            }
        }
    }
}
function spawnHauler(myRoom, myContainer) {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }
    //Have a valid spawn now
    let body = [MOVE];
    let addCarry = true;
    let breakLoop = false;
    while (!breakLoop) {
        if (addCarry) {
            addCarry = false;
            if (calcBodyCost(body) + calcBodyCost([CARRY]) < spawn.room.energyCapacityAvailable) {
                body = body.concat([CARRY]);
            }
            else {
                breakLoop = true;
            }
        }
        else {
            addCarry = true;
            if (calcBodyCost(body) + calcBodyCost([MOVE]) < spawn.room.energyCapacityAvailable) {
                body = body.concat([MOVE]);
            }
            else {
                breakLoop = true;
            }
        }
    }
    const id = getId();
    const result = spawn.spawnCreep(body, "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name,
            cacheContainerIdToGrabFrom: myContainer.id,
            pickup: true
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name,
            cacheContainerIdToGrabFrom: myContainer.id,
            pickup: true
        };
    }
    return null;
}
function ensureLaborersSpawnIfNeeded(myRoom) {
    if (myRoom.roomStage >= 3) {
        for (let i = 0; i < myRoom.myContainers.length; i++) {
            const myContainer = myRoom.myContainers[i];
            if (myContainer.role === "Bank") {
                const bankContainer = Game.getObjectById(myContainer.id);
                if (bankContainer != null) {
                    if (bankContainer.store[RESOURCE_ENERGY] === bankContainer.storeCapacity) {
                        //If the bank is capped, spawn another laborer
                        const newCreep = spawnLaborer(myRoom);
                        if (newCreep != null) {
                            myRoom.myCreeps.push(newCreep);
                            console.log("LOG: Spawned a new Laborer");
                        }
                    }
                }
                else {
                    console.log("ERR: Bank is null");
                }
            }
        }
    }
}
function calcBodyCost(body) {
    return body.reduce(function (cost, part) {
        return cost + BODYPART_COST[part];
    }, 0);
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
