import { GlobalFunctions } from "global.functions";
import { Constants } from "constants";

export const roomSpawnLaborer: any = {
    trySpawnLaborer: function (myRoom: MyRoom, laborerCount: number) {
        if (myRoom.bankPos == null) {
            //Only spawn laborers through this method if the bank is real
            return;
        }

        const bank: StructureStorage | null = GlobalFunctions.getBank(myRoom);
        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }

        if (bank.store[RESOURCE_ENERGY] >= Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER &&
            laborerCount < Constants.MAX_LABORERS) {
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

    let spawn: StructureSpawn | null;

    if (myRoom.spawns.length === 0 ||
        Game.spawns[myRoom.spawns[0].name] == null) {
        // A room needs a laborer, but it has no spawns yet
        // Going to use the nearest room's spawn instead
        spawn = GlobalFunctions.findClosestSpawn(new RoomPosition(25, 25, myRoom.name));
        if (spawn == null) {
            console.log("ERR: Couldn't find any spawns to make a laborer for room " + myRoom.name);
            return null;
        }
    } else {
        spawn = Game.spawns[myRoom.spawns[0].name];
    }

    //Have a valid spawn now

    //Once the bank is setup, use the best body you can get
    const useBestBody: boolean = myRoom.roomStage >= 4;
    const body: BodyPartConstant[] = GlobalFunctions.generateBody([MOVE, MOVE, CARRY, WORK], [MOVE, MOVE, CARRY, WORK], spawn.room, useBestBody);

    const id = GlobalFunctions.getId();
    const result: ScreepsReturnCode =
        spawn.spawnCreep(
            body,
            "Creep" + id,
            {
                memory:
                {
                    name: "Creep" + id,
                    role: "Laborer",
                    assignedRoomName: myRoom.name
                }
            }
        );

    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Laborer",
            assignedRoomName: myRoom.name,
            state: "Labor"
        };
    }
    return null;
}
