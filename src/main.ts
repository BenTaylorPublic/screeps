import { roleHarvester } from "roles/role.harvester";
export const loop: any = function () {

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role == "harvester") {
            roleHarvester.run(creep);
        }
    }
};