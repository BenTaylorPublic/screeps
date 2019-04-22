import { GlobalFunctions } from "global.functions";

export const roomSpawnBankLinker: any = {
    run: function (myRoom: MyRoom) {
        if (myRoom.roomStage < 5) { return; }
        if (myRoom.bankLinkerName != null) { return; }
        const bankLinker: BankLinker | null = spawnBankLinker(myRoom);
        if (bankLinker != null) {
            myRoom.myCreeps.push(bankLinker);
            myRoom.bankLinkerName = bankLinker.name;
        }
    }
};

function spawnBankLinker(myRoom: MyRoom): BankLinker | null {
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
                    role: "Hauler",
                    assignedRoomName: spawn.room.name
                }
            }
        );

    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name
        };
    }
    return null;
}
