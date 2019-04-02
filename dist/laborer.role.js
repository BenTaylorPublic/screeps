"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laborerRole = {
    run: function (laborer, myRoom) {
        const creep = Game.creeps[laborer.name];
        if (creep == null) {
            console.log("Laborer creep is null. Creep ID: " + laborer.name);
            return;
        }
        if (laborer.pickup === false &&
            creep.carry.energy === 0) {
            laborer.pickup = true;
            creep.say("pickup");
        }
        else if (laborer.pickup === true &&
            creep.carry.energy === creep.carryCapacity) {
            laborer.pickup = false;
            creep.say("working");
        }
        if (laborer.pickup === true) {
            for (let i = 0; i < myRoom.myContainers.length; i++) {
                const myContainer = myRoom.myContainers[i];
                if (myContainer.role === "Bank") {
                    const bankContainer = Game.getObjectById(myContainer.id);
                    if (bankContainer != null) {
                        if (creep.withdraw(bankContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(bankContainer);
                        }
                    }
                    else {
                        console.log("Bank is null");
                    }
                }
            }
        }
        else {
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
                if (structureToAddTo != null) {
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
    }
};
