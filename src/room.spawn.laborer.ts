import { global } from "global";

export const roomSpawnLaborer: any = {
    trySpawnLaborer: function (myRoom: MyRoom) {
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
};


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
        if (global.calcBodyCost(body) + global.calcBodyCost([MOVE, MOVE, CARRY, WORK]) < spawn.room.energyAvailable) {
            body = body.concat([MOVE, MOVE, CARRY, WORK]);
        } else {
            breakLoop = true;
        }
    }

    const id = global.getId();
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