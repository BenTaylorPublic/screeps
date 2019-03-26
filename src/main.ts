import { rcl1RoleAll } from "rcl1.role.all";
import { tower } from "tower";
console.log("Starting script v2");
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

    for (let name in Game.creeps) {
        let creep: Creep = Game.creeps[name];
        rcl1RoleAll.run(creep);
        creepCount++;
    }

    if (creepCount < 6) {
        let newCreep: Creep = spawnHarvester(Game.spawns.Spawn1);
        rcl1RoleAll.run(newCreep);
    }
};

function spawnHarvester(spawn: StructureSpawn): Creep {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "rcl1", harvesting: true } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    let toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
