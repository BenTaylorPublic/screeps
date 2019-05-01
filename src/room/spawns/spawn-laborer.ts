import { HelperFunctions } from "../../global/helper-functions";
import { Constants } from "../../global/constants";

export class SpawnLaborer {
    public static trySpawnLaborer(myRoom: MyRoom, laborerCount: number): void {
        if (myRoom.bankPos == null) {
            //Only spawn laborers through this method if the bank is real
            return;
        }

        const bank: StructureStorage | null = myRoom.bank;
        if (bank == null) {
            console.log("ERR: Bank is null when checking if it's full");
            return;
        }

        if (bank.store[RESOURCE_ENERGY] >= Constants.AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER &&
            laborerCount < Constants.MAX_LABORERS) {
            //If the bank is capped, spawn another laborer
            const newCreep: Laborer | null = this.spawnLaborer(myRoom);
            if (newCreep != null) {
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Spawned a new Laborer");
            }
        }
    }

    public static forceSpawnLaborer(myRoom: MyRoom): void {
        const newCreep: Laborer | null = this.spawnLaborer(myRoom);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Force spawned a new Laborer");
        }
    }

    private static spawnLaborer(myRoom: MyRoom): Laborer | null {

        let spawn: StructureSpawn | null;

        if (myRoom.spawns.length === 0 ||
            Game.spawns[myRoom.spawns[0].name] == null) {
            // A room needs a laborer, but it has no spawns yet
            // Going to use the nearest room's spawn instead
            spawn = HelperFunctions.findClosestSpawn(new RoomPosition(25, 25, myRoom.name));
            if (spawn == null) {
                console.log("ERR: Couldn't find any spawns to make a laborer for room " + myRoom.name);
                return null;
            }
        } else {
            spawn = Game.spawns[myRoom.spawns[0].name];
        }

        //Have a valid spawn now

        //Once the bank is setup, use the best body you can get
        const body: BodyPartConstant[] = HelperFunctions.generateBody([MOVE, MOVE, CARRY, WORK], [MOVE, MOVE, CARRY, WORK], spawn.room, false);

        const id = HelperFunctions.getId();
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

}

