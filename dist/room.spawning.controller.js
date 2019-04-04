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
    if (mySource.cachePos == null) {
        console.log("ERR: Attempted to spawn miner to a source with no cache container poss");
        return null;
    }
    //Have a valid spawn now
    const id = getId();
    const result = spawn.spawnCreep([MOVE, WORK, WORK, WORK, WORK, WORK], "Creep" + id, {
        memory: {
            name: "Creep" + id,
            role: "Miner",
            assignedRoomName: spawn.room.name
        }
    });
    if (result === OK) {
        mySource.minerName = "Creep" + id;
        return {
            name: "Creep" + id,
            role: "Miner",
            assignedRoomName: spawn.room.name,
            cachePosToMineOn: mySource.cachePos,
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
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.haulerNames.length < 2) {
            //Spawn a new hauler
            const newCreep = spawnHauler(myRoom, mySource);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                mySource.haulerNames.push(newCreep.name);
                console.log("LOG: Spawned a new hauler");
            }
        }
    }
}
function spawnHauler(myRoom, mySource) {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn = Game.spawns[myRoom.spawnName];
    if (spawn == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }
    if (mySource.cachePos == null) {
        console.log("ERR: Attempted to spawn hauler for a source with no cache pos");
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
            assignedRoomName: spawn.room.name
        }
    });
    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name,
            cachePosToPickupFrom: mySource.cachePos,
            pickup: true
        };
    }
    return null;
}
function ensureLaborersSpawnIfNeeded(myRoom) {
    if (myRoom.roomStage >= 3) {
        if (myRoom.bankPos == null) {
            console.log("ERR: Room's bank pos was null");
            return;
        }
        const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
        let bank = null;
        const structures = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                bank = structure;
                break;
            }
            else if (structure.structureType === STRUCTURE_STORAGE) {
                bank = structure;
                break;
            }
        }
        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }
        if (bank.store[RESOURCE_ENERGY] === bank.storeCapacity) {
            //If the bank is capped, spawn another laborer
            const newCreep = spawnLaborer(myRoom);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
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
