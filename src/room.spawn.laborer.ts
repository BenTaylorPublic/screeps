import { global } from "global";

export const roomSpawnLaborer: any = {
    trySpawnLaborer: function (myRoom: MyRoom) {
        if (myRoom.roomStage < 2.8) {
            return;
        }

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
    },
    forceSpawnLaborer: function (myRoom: MyRoom) {
        const newCreep: Laborer | null = spawnLaborer(myRoom);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Force spawned a new Laborer");
        }
    }
};


function spawnLaborer(myRoom: MyRoom): Laborer | null {
    if (myRoom.spawns.length === 0) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

    if (spawn == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (2)");
        return null;
    }

    //Have a valid spawn now

    const useBestBody: boolean = myRoom.roomStage >= 3;
    const body: BodyPartConstant[] = global.generateBody([MOVE, MOVE, CARRY, WORK], [MOVE, MOVE, CARRY, WORK], spawn.room, useBestBody);

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
                    assignedRoomName: spawn.room.name
                }
            }
        );

    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: spawn.room.name,
            state: "Labor"
        };
    }
    return null;
}
