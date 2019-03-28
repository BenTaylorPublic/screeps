export const roleMinerAndWorker: any = {
    run: function (creep: Creep) {
        if (creep == null) {
            console.log("A creep was null");
            return;
        }
        if (!creep.memory.mining && creep.carry.energy === 0) {
            creep.memory.mining = true;
            creep.say("mining");
        } else if (creep.memory.mining && creep.carry.energy === creep.carryCapacity) {
            creep.memory.mining = false;
            creep.say("working");
        }

        if (creep.memory.mining) {
            //Harvesting
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        } else {
            //Not harvesting
            //Check if controller is anywhere close to downgrading
            let forceUpdateController: boolean = false;
            if (creep.room.controller != null &&
                creep.room.controller.ticksToDowngrade < 5000) {
                forceUpdateController = true;
            }
            if (!forceUpdateController) {
                //Adding energy to structures that need it
                const structureToAddTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure: any) => {
                        return (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if (structureToAddTo) {
                    if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structureToAddTo);
                        return; //Don't need to look at other things to do
                    }
                }

                //Building construction sites
                const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length) {
                    if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSites[0]);
                        return; //Don't need to look at other things to do
                    }
                }
            }

            //Upgrading room controller
            if (creep.upgradeController(creep.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller as StructureController);
                return; //Don't need to look at other things to do
            }
        }
    }
};
