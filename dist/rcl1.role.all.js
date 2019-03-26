"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rcl1RoleAll = {
    run: function (creep) {
        //Swapping state
        if (creep == null) {
            console.log("A creep was null");
            return;
        }
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
            let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else {
            //Not harvesting
            //Check if controller is anywhere close to downgrading
            let forceUpdateController = false;
            if (creep.room.controller != null &&
                creep.room.controller.ticksToDowngrade < 5000) {
                forceUpdateController = true;
            }
            if (!forceUpdateController) {
                //Adding energy to structures that need it
                let structureToAddTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
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
                let constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length) {
                    if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSites[0]);
                        return; //Don't need to look at other things to do
                    }
                }
            }
            //Upgrading room controller
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                return; //Don't need to look at other things to do
            }
        }
    }
};
