"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rcl1RoleAll = {
    run: function (creep) {
        //Swapping state
        if (!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
            creep.say("harvesting");
        }
        else if (creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.say("not harvesting");
        }
        if (creep.memory.harvesting) {
            //Harvesting
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else {
            //Not harvesting
            //Adding energy to structures that need it
            var structureToAddTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (structureToAddTo) {
                if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structureToAddTo);
                    return; //Don't need to look at other things to do
                }
            }
            //Building construction sites
            var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (constructionSites.length) {
                if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSites[0]);
                    return; //Don't need to look at other things to do
                }
            }
            //Upgrading
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                return; //Don't need to look at other things to do
            }
        }
    }
};
