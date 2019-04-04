"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.laborerRole = {
    run: function (laborer, myRoom) {
        const creep = Game.creeps[laborer.name];
        if (creep == null) {
            console.log("ERR: Laborer creep is null. Creep ID: " + laborer.name);
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
            if (myRoom.bankPos == null) {
                console.log("ERR: Room's bank pos was null");
                return;
            }
            const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
            if (bankPos.isNearTo(creep)) {
                let bank = null;
                const structures = bankPos.lookFor(LOOK_STRUCTURES);
                for (let i = 0; i < structures.length; i++) {
                    const structure = structures[i];
                    if (structure.structureType === STRUCTURE_CONTAINER) {
                        bank = structure;
                        break;
                    }
                    else if (structure.structureType === STRUCTURE_STORAGE) {
                        bank = structure;
                        break;
                    }
                }
                if (bank == null) {
                    console.log("ERR: Bank is null for laborer: " + laborer.name);
                    return;
                }
                creep.withdraw(bank, RESOURCE_ENERGY);
            }
            else {
                creep.moveTo(bankPos);
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
                    givenCommand = true;
                    if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structureToAddTo);
                    }
                }
            }
            //Building construction sites
            if (!givenCommand) {
                const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length > 0) {
                    givenCommand = true;
                    if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSites[0]);
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
