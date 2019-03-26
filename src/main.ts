import { rcl1RoleAll } from "rcl1.role.all";
import { tower } from "tower";
import { rcl2Controller } from "rcl2.controller";
console.log("Starting script v3");
export const loop: any = function () {
    let towers: AnyStructure[] = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower.run);

    let creepCount: number = 0;

    //Clear all dead creeps
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    if (Memory.myMemory.rclStage <= 1) {
        for (let name in Game.creeps) {
            let creep: Creep = Game.creeps[name];
            rcl1RoleAll.run(creep);
            creepCount++;
        }

        if (creepCount < 6) {
            let newCreep: Creep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            rcl1RoleAll.run(newCreep);
        }
    }
    else if (Memory.myMemory.rclStage >= 2) {
        for (let roomName in Game.rooms) {
            let room: Room = Game.rooms[roomName];
            let creepsInThisRoom: Creep[] = [];
            for (let creepName in Game.creeps) {
                if (Game.creeps[creepName].room.name == roomName) {
                    creepsInThisRoom.push(Game.creeps[creepName]);
                }
            }
            rcl2Controller.run(room, creepsInThisRoom);
        }
    }

};

function spawnBasicWorker(spawn: StructureSpawn): Creep {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    let toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
