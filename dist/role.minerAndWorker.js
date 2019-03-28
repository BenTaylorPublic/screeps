"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMinerAndWorker = {
    run: function (minerAndWorker) {
        const creep = Game.creeps[minerAndWorker.name];
        if (creep == null) {
            console.error("A creep was null");
            return;
        }
        if (minerAndWorker.mining === false && creep.carry.energy === 0) {
            minerAndWorker.mining = true;
            creep.say("mining");
        }
        else if (minerAndWorker.mining === true && creep.carry.energy === creep.carryCapacity) {
            minerAndWorker.mining = false;
            creep.say("working");
        }
        if (minerAndWorker.mining === true) {
            //mining
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else {
            //Not mining
            let givenCommand = false;
            //Check if controller is anywhere close to downgrading
            let forceUpgradeController = false;
            if (creep.room.controller != null &&
                creep.room.controller.ticksToDowngrade < 5000) {
                forceUpgradeController = true;
                givenCommand = true;
            }
            if (!givenCommand) {
                //Adding energy to structures that need it
                const structureToAddTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if (structureToAddTo) {
                    if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structureToAddTo);
                        givenCommand = true;
                    }
                }
            }
            //Building construction sites
            if (!givenCommand) {
                const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length) {
                    if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSites[0]);
                        givenCommand = true;
                    }
                }
            }
            //Upgrading room controller
            if ((forceUpgradeController || !givenCommand) &&
                creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        //Sync memory
        creep.memory = minerAndWorker;
    }
};
