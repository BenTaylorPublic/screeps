import { roleHarvester } from "roles/role.harvester";
import { roleUpgrader } from "roles/role.upgrader";
import { roleBuilder } from "roles/role.builder";
import { tower } from "tower";
let globalId = 0;
export const loop = function () {
    let towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower.run);
    let harvesterCount = 0;
    let upgraderCount = 0;
    let builderCount = 0;
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role === "harvester") {
            roleHarvester.run(creep);
            harvesterCount++;
        }
        else if (creep.memory.role === "upgrader") {
            roleUpgrader.run(creep);
            upgraderCount++;
        }
        else if (creep.memory.role === "builder") {
            roleBuilder.run(creep);
            builderCount++;
        }
    }
    if (harvesterCount < 2) {
        let newCreep = spawnHarvester(Game.spawns.Spawn1);
        roleHarvester.run(newCreep);
    }
    else if (upgraderCount < 2) {
        let newCreep = spawnUpgrader(Game.spawns.Spawn1);
        roleUpgrader.run(newCreep);
    }
    else if (builderCount < 2) {
        let newCreep = spawnBuilder(Game.spawns.Spawn1);
        roleBuilder.run(newCreep);
    }
};
function spawnHarvester(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "harvester" } });
    return Game.creeps["Creep" + id];
}
function spawnUpgrader(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "upgrader" } });
    return Game.creeps["Creep" + id];
}
function spawnBuilder(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "builder" } });
    return Game.creeps["Creep" + id];
}
function getId() {
    let toReturn = globalId;
    globalId++;
    return toReturn;
}
