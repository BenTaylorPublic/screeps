import {SpawnLaborer} from "./spawn-laborer";

export class RoomSpawnController {
    public static run(myRoom: MyRoom): void {
        SpawnLaborer.laborerSpawnLogic(myRoom);

        if (myRoom.spawnQueue.length === 0) {
            return;
        }

        const creepToSpawn: QueuedCreep = myRoom.spawnQueue[0];
        if (Game.rooms[myRoom.name].energyAvailable < creepToSpawn.energyCost) {
            //Too costly to spawn
            return;
        }

        let spawn: StructureSpawn | null = null;
        for (let i: number = 0; i < myRoom.spawns.length; i++) {
            spawn = Game.spawns[myRoom.spawns[i].name];
            if (spawn.spawning != null) {
                spawn = null;
            } else {
                break;
            }
        }
        if (spawn == null) {
            return;
        }

        const result: ScreepsReturnCode = spawn.spawnCreep(creepToSpawn.body, creepToSpawn.name);

        if (result === OK) {
            myRoom.spawnQueue.splice(0, 1);
        }
    }
}
