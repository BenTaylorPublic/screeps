import { global } from "global";

export const roomSpawnMinerAndWorker: any = {
    trySpawnMinerAndWorker: function (myRoom: MyRoom) {
        const newCreep: MinerAndWorker | null = spawnMinerAndWorker(myRoom.spawnName);
        if (newCreep != null) {
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Spawned a new MinerAndWorker");
        }
    }
};

function spawnMinerAndWorker(spawnName: string | null): MinerAndWorker | null {
    if (spawnName == null) {
        return null; //spawn name not set
    }
    const spawn: StructureSpawn = Game.spawns[spawnName];
    const id = global.getId();
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
