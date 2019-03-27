import { basicWorkerRole } from "basicworker.role.all";
import { devController } from "dev.controller";
console.log("Starting script v4");
export const loop: any = function () {
    let creepCount: number = 0;

    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    if (Memory.myMemory.prod) {
        //Prod
        for (const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            basicWorkerRole.run(creep);
            creepCount++;
        }

        if (creepCount < 6) {
            const newCreep: Creep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            basicWorkerRole.run(newCreep);
        }
    } else if (!Memory.myMemory.prod) {
        //Dev
        for (const roomName in Game.rooms) {
            const room: Room = Game.rooms[roomName];
            const creepsInThisRoom: Creep[] = [];
            for (const roomWithAssignedData in Memory.myMemory.rooms) {

            }
            devController.run(room, creepsInThisRoom);
        }
    }

};

function spawnBasicWorker(spawn: StructureSpawn): Creep {
    const id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { stage: 1, role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    const toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
