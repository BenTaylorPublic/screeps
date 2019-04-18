"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.roleLaborer = {
    run: function (laborer, myRoom) {
        const creep = Game.creeps[laborer.name];
        if (creep == null) {
            console.log("ERR: Laborer creep is null. Creep ID: " + laborer.name);
            return;
        }
        calculateCreepState(laborer, myRoom, creep);
        if (laborer.state === "PickupBank") {
            pickupBank(laborer, myRoom, creep);
        }
        else if (laborer.state === "PickupCache") {
            pickupCache(laborer, myRoom, creep);
        }
        else if (laborer.state === "Mining") {
            mining(laborer, myRoom, creep);
        }
        else { //Labor
            labor(laborer, myRoom, creep);
        }
    }
};
function calculateCreepState(laborer, myRoom, creep) {
    if (laborer.state === "Labor" &&
        creep.carry.energy === 0) {
        if (myRoom.bankPos == null) {
            laborer.state = "Mining";
            return;
        }
        const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
        const bank = global_functions_1.globalFunctions.getBank(myRoom);
        if (bank != null &&
            bank.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
            laborer.state = "PickupBank";
            creep.say("PickupBank");
            return;
        }
        else if (myRoom.roomStage >= 1) {
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource = myRoom.mySources[i];
                if (mySource.cachePos != null) {
                    const cachePos = global_functions_1.globalFunctions.myPosToRoomPos(mySource.cachePos);
                    const structures = cachePos.lookFor(LOOK_STRUCTURES);
                    for (let j = 0; j < structures.length; j++) {
                        const structure = structures[j];
                        if (structure.structureType === STRUCTURE_CONTAINER) {
                            const cache = structure;
                            if (cache.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
                                laborer.state = "PickupCache";
                                creep.say("PickupCache");
                                return;
                            }
                        }
                    }
                }
            }
            //Couldn't find a cache to pickup from, mine instead
            laborer.state = "Mining";
            creep.say("Mining");
            return;
        }
        else {
            laborer.state = "Mining";
            creep.say("Mining");
            return;
        }
    }
    else if ((laborer.state === "PickupBank" ||
        laborer.state === "Mining" ||
        laborer.state === "PickupCache") &&
        creep.carry.energy === creep.carryCapacity) {
        laborer.state = "Labor";
        creep.say("work work");
    }
}
function pickupBank(laborer, myRoom, creep) {
    if (myRoom.bankPos == null) {
        console.log("ERR: Room's bank pos was null");
        return;
    }
    const bankPos = global_functions_1.globalFunctions.myPosToRoomPos(myRoom.bankPos);
    if (bankPos.isNearTo(creep)) {
        const bank = global_functions_1.globalFunctions.getBank(myRoom);
        if (bank == null) {
            console.log("ERR: Room's bank was null");
            return;
        }
        creep.withdraw(bank, RESOURCE_ENERGY);
    }
    else {
        creep.moveTo(bankPos);
    }
}
function pickupCache(laborer, myRoom, creep) {
    let validCacheToGrabFrom = null;
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.cachePos != null) {
            const cachePos = global_functions_1.globalFunctions.myPosToRoomPos(mySource.cachePos);
            const structures = cachePos.lookFor(LOOK_STRUCTURES);
            for (let j = 0; j < structures.length; j++) {
                const structure = structures[j];
                if (structure.structureType === STRUCTURE_CONTAINER) {
                    const cache = structure;
                    if (cache.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
                        validCacheToGrabFrom = cache;
                    }
                }
            }
        }
    }
    if (validCacheToGrabFrom == null) {
        console.log("ERR: Laborer can't see any caches with enough energy. Setting to Mine.");
        laborer.state = "Mining";
        return;
    }
    if (validCacheToGrabFrom.pos.isNearTo(creep)) {
        creep.withdraw(validCacheToGrabFrom, RESOURCE_ENERGY);
    }
    else {
        creep.moveTo(validCacheToGrabFrom.pos);
    }
}
function mining(laborer, myRoom, creep) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source != null &&
        creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }
}
function labor(laborer, myRoom, creep) {
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
