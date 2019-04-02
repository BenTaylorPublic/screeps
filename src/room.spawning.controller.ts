export const roomSpawningController: any = {
    run: function (myRoom: MyRoom) {

        let minerAndWorkerCount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "MinerAndWorker") {
                minerAndWorkerCount++;
            }
        }

        //Force spawn a miner and worker if there are no creeps alive
        const forceSpawnMinerAndWorkers: boolean = myRoom.myCreeps.length === 0;

        if (forceSpawnMinerAndWorkers ||
            (minerAndWorkerCount < 6 && myRoom.roomStage < 3)) {
            const newCreep: MinerAndWorker | null = spawnMinerAndWorker(myRoom.spawnName);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("spawned a new miner and worker");
            }
        } else {
            ensureLaborersSpawnIfNeeded(myRoom);
            ensureMinersArePlaced(myRoom);
            ensureHaulersArePlaced(myRoom);
        }
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
                console.log("spawned a new miner");
            }
        }
    }
}

function spawnLaborer(myRoom: MyRoom): Laborer | null {
    if (myRoom.spawnName == null) {
        console.log("attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        console.log("attempted to spawn miner in a room with no spawner (2)");
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
        console.log("attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        console.log("attempted to spawn miner in a room with no spawner (2)");
        return null;
    }

    if (mySource.cacheContainerId == null) {
        console.log("attempted to spawn miner to a source with no cache container id");
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

function getId(): number {
    const toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
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
                const newCreep: Hauler | null = spawnHauler(myRoom, myContainer);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    myContainer.haulerNames.push(newCreep.name);
                    console.log("spawned a new hauler");
                }
            }
        }
    }
}

function spawnHauler(myRoom: MyRoom, myContainer: MyContainer): Hauler | null {
    if (myRoom.spawnName == null) {
        console.log("attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawnName];

    if (spawn == null) {
        console.log("attempted to spawn hauler in a room with no spawner (2)");
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
                    assignedRoomName: spawn.room.name,
                    cacheContainerIdToGrabFrom: myContainer.id,
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
            pickup: true
        };
    }
    return null;
}

function ensureLaborersSpawnIfNeeded(myRoom: MyRoom): void {
    if (myRoom.roomStage >= 3) {
        for (let i = 0; i < myRoom.myContainers.length; i++) {
            const myContainer: MyContainer = myRoom.myContainers[i];
            if (myContainer.role === "Bank") {
                const bankContainer: StructureContainer | null =
                    Game.getObjectById<StructureContainer>(myContainer.id);
                if (bankContainer != null) {
                    if (bankContainer.store[RESOURCE_ENERGY] === bankContainer.storeCapacity) {
                        //If the bank is capped, spawn another laborer
                        const newCreep: Laborer | null = spawnLaborer(myRoom);
                        if (newCreep != null) {
                            myRoom.myCreeps.push(newCreep);
                            console.log("spawned a new laborer");
                        }
                    }
                } else {
                    console.log("Bank is null");
                }
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


