import { stage1RoleAll } from "stage1.role.all";
import { stage2Controller } from "stage2.controller";
console.log("Starting script v4");
export const loop: any = function () {
    let creepCount: number = 0;

    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    if (Memory.myMemory.stage <= 1) {
        for (const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            stage1RoleAll.run(creep);
            creepCount++;
        }

        if (creepCount < 6) {
            const newCreep: Creep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            stage1RoleAll.run(newCreep);
        }
    } else if (Memory.myMemory.stage >= 2) {
        for (const roomName in Game.rooms) {
            const room: Room = Game.rooms[roomName];
            const creepsInThisRoom: Creep[] = [];
            for (const roomWithAssignedData in Memory.myMemory.rooms) {

            }
            stage2Controller.run(room, creepsInThisRoom);
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
