import { stage1RoleAll } from "stage1.role.all";
import { stage2Controller } from "stage2.controller";
console.log("Starting script v4");
export const loop: any = function () {
    let creepCount: number = 0;

    //Clear all dead creeps
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    if (Memory.myMemory.stage <= 1) {
        for (let name in Game.creeps) {
            let creep: Creep = Game.creeps[name];
            stage1RoleAll.run(creep);
            creepCount++;
        }

        if (creepCount < 6) {
            let newCreep: Creep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            stage1RoleAll.run(newCreep);
        }
    }
    else if (Memory.myMemory.stage >= 2) {
        for (let roomName in Game.rooms) {
            let room: Room = Game.rooms[roomName];
            let creepsInThisRoom: Creep[] = [];
            for (let roomWithAssignedData in Memory.myMemory.rooms) {

            }
            stage2Controller.run(room, creepsInThisRoom);
        }
    }

};

function spawnBasicWorker(spawn: StructureSpawn): Creep {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { stage: 1, role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    let toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
