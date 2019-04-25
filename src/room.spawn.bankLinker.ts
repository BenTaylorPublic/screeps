import { GlobalFunctions } from "global.functions";

export class RoomSpawnBankLinker {
    static run(myRoom: MyRoom) {
        if (myRoom.roomStage < 5) { return; }
        if (myRoom.bankLinkerName != null) { return; }
        const bankLinker: BankLinker | null = this.spawnBankLinker(myRoom);
        if (bankLinker != null) {
            myRoom.myCreeps.push(bankLinker);
            myRoom.bankLinkerName = bankLinker.name;
        }
    }

    private static spawnBankLinker(myRoom: MyRoom): BankLinker | null {
        if (myRoom.spawns.length === 0) {
            console.log("ERR: Attempted to spawn BankLinker in a room with no spawner (1)");
            return null;
        }
        const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

        if (spawn == null) {
            console.log("ERR: Attempted to spawn BankLinker in a room with no spawner (2)");
            return null;
        }

        //Have a valid spawn now

        const id = GlobalFunctions.getId();
        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                [MOVE, CARRY],
                "Creep" + id,
                {
                    memory:
                    {
                        name: "Creep" + id,
                        role: "BankLinker",
                        assignedRoomName: spawn.room.name
                    }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "BankLinker",
                assignedRoomName: spawn.room.name
            };
        }
        return null;
    }
}