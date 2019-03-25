import { roleHarvester } from "roles/role.harvester";
import { roleUpgrader } from "roles/role.upgrader";
import { roleBuilder } from "roles/role.builder";
import { tower } from "tower";

export const loop: any = function () {
    var towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower.run);

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
};
