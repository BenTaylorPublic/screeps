
export const roleUpgrader: any = {
    run: function (creep: Creep) {

        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller as StructureController);
            }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    }
};
