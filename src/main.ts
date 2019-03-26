import { roleHarvester } from "role.harvester";
import { roleUpgrader } from "role.upgrader";
import { roleBuilder } from "role.builder";
import { tower } from "tower";

let globalId: number = 0;

export const loop: any = function () {
    let towers: AnyStructure[] = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower.run);

    let harvesterCount: number = 0;
    let upgraderCount: number = 0;
    let builderCount: number = 0;

    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    for (let name in Game.creeps) {
        let creep: Creep = Game.creeps[name];

        if (creep.memory.role === "harvester") {
            roleHarvester.run(creep);
            harvesterCount++;
        } else if (creep.memory.role === "upgrader") {
            roleUpgrader.run(creep);
            upgraderCount++;
        } else if (creep.memory.role === "builder") {
            roleBuilder.run(creep);
            builderCount++;
        }
    }

    if (harvesterCount < 2) {
        let newCreep: Creep = spawnHarvester(Game.spawns.Spawn1);
        roleHarvester.run(newCreep);
    } else if (upgraderCount < 2) {
        let newCreep: Creep = spawnUpgrader(Game.spawns.Spawn1);
        roleUpgrader.run(newCreep);
    } else if (builderCount < 2) {
        let newCreep: Creep = spawnBuilder(Game.spawns.Spawn1);
        roleBuilder.run(newCreep);
    }
};

function spawnHarvester(spawn: StructureSpawn): Creep {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "harvester" } });
    return Game.creeps["Creep" + id];
}
function spawnUpgrader(spawn: StructureSpawn): Creep {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "upgrader" } });
    return Game.creeps["Creep" + id];
}
function spawnBuilder(spawn: StructureSpawn): Creep {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "builder" } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    let toReturn: number = globalId;
    globalId++;
    return toReturn;
}
