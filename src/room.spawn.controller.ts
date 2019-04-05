export const roomSpawnController: any = {
    run: function (myRoom: MyRoom) {

        let minerAndWorkerCount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "MinerAndWorker") {
                minerAndWorkerCount++;
            }
        }

        //Force spawn a miner and worker if there are no creeps alive
        // const forceSpawnMinerAndWorkers: boolean = myRoom.myCreeps.length === 0;

        // if (forceSpawnMinerAndWorkers ||
        //     (minerAndWorkerCount < 6 && myRoom.roomStage < 3)) {
            // const newCreep: MinerAndWorker | null = spawnMinerAndWorker(myRoom.spawnName);
            // if (newCreep != null) {
            //     myRoom.myCreeps.push(newCreep);
            //     console.log("LOG: Spawned a new MinerAndWorker");
            // }
        // } else {
            ensureLaborersSpawnIfNeeded(myRoom);
            ensureMinersArePlaced(myRoom);
            ensureHaulersArePlaced(myRoom);
        // }
    }
};

function ensureMinersArePlaced(myRoom: MyRoom): void {
    if (myRoom.roomStage < 2.6) {
        return;
    }

    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.minerName == null) {
            //Needs a new miner
            const newCreep: Miner | null = spawnMiner(myRoom, mySource);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Miner");
                return;
            }
        }
    }
}

function spawnLaborer(myRoom: MyRoom): Laborer | null {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (2)");
        return null;
    }

    //Have a valid spawn now
    let body: BodyPartConstant[] = [MOVE, MOVE, CARRY, WORK];
    let breakLoop: boolean = false;
    while (!breakLoop) {
        if (calcBodyCost(body) + calcBodyCost([MOVE, MOVE, CARRY, WORK]) < spawn.room.energyCapacityAvailable) {
            body = body.concat([MOVE, MOVE, CARRY, WORK]);
        } else {
            breakLoop = true;
        }
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
                    role: "Laborer",
                    assignedRoomName: spawn.room.name,
                    pickup: true
                }
            }
        );

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

function spawnMiner(myRoom: MyRoom, mySource: MySource): Miner | null {

    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

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
    const result: ScreepsReturnCode =
        spawn.spawnCreep(
            [MOVE, WORK, WORK, WORK, WORK, WORK],
            "Creep" + id,
            {
                memory:
                {
                    name: "Creep" + id,
                    role: "Miner",
                    assignedRoomName: spawn.room.name
                }
            }
        );

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

function getId(): number {
    const toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}

function ensureHaulersArePlaced(myRoom: MyRoom): void {

    if (myRoom.roomStage < 2.6) {
        return;
    }

    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.haulerNames.length === 0) {
            //Spawn a new hauler
            const newCreep: Hauler | null = spawnHauler(myRoom, mySource);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                mySource.haulerNames.push(newCreep.name);
                console.log("LOG: Spawned a new hauler");
                return;
            }
        }

    }
}

function spawnHauler(myRoom: MyRoom, mySource: MySource): Hauler | null {
    if (myRoom.spawnName == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }

    if (mySource.cachePos == null) {
        console.log("ERR: Attempted to spawn hauler for a source with no cache pos");
        return null;
    }

    //Have a valid spawn now
    let body: BodyPartConstant[] = [MOVE];
    let addCarry: boolean = true;
    let breakLoop: boolean = false;
    while (!breakLoop) {
        if (addCarry) {
            addCarry = false;
            if (calcBodyCost(body) + calcBodyCost([CARRY]) < spawn.room.energyCapacityAvailable) {
                body = body.concat([CARRY]);
            } else {
                breakLoop = true;
            }
        } else {
            addCarry = true;
            if (calcBodyCost(body) + calcBodyCost([MOVE]) < spawn.room.energyCapacityAvailable) {
                body = body.concat([MOVE]);
            } else {
                breakLoop = true;
            }
        }
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
                    assignedRoomName: spawn.room.name
                }
            }
        );

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

function ensureLaborersSpawnIfNeeded(myRoom: MyRoom): void {
    if (myRoom.roomStage >= 3) {

        if (myRoom.bankPos == null) {
            console.log("ERR: Room's bank pos was null");
            return;
        }

        const bankPos: RoomPosition
            = new RoomPosition(myRoom.bankPos.x,
                myRoom.bankPos.y,
                myRoom.bankPos.roomName);

        let bank: StructureContainer | StructureStorage | null = null;

        const structures: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            const structure: Structure = structures[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                bank = structure as StructureContainer;
                break;
            } else if (structure.structureType === STRUCTURE_STORAGE) {
                bank = structure as StructureStorage;
                break;
            }
        }

        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }

        if (bank.store[RESOURCE_ENERGY] === bank.storeCapacity) {
            //If the bank is capped, spawn another laborer
            const newCreep: Laborer | null = spawnLaborer(myRoom);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
            }
        }
    }
}

function calcBodyCost(body: BodyPartConstant[]): number {
    return body.reduce(function (cost: number, part: BodyPartConstant) {
        return cost + BODYPART_COST[part];
    }, 0);
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


