import { roleHarvester } from "role.harvester";
import { FIND_SOURCES_ACTIVE, ERR_NOT_IN_RANGE, FIND_STRUCTURES, STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER, RESOURCE_ENERGY } from "constants";

export const loop: any = function () {

    var towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower.run);

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
    }
};