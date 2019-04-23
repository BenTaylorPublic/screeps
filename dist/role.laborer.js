"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
class RoleLaborer {
    static run(laborer, myRoom) {
        const creep = Game.creeps[laborer.name];
        if (creep == null) {
            console.log("ERR: Laborer creep is null. Creep ID: " + laborer.name);
            return;
        }
        if (laborer.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, laborer.assignedRoomName));
            return;
        }
        this.calculateCreepState(laborer, myRoom, creep);
        if (laborer.state === "PickupBank") {
            this.pickupBank(laborer, myRoom, creep);
        }
        else if (laborer.state === "PickupCache") {
            this.pickupCache(laborer, myRoom, creep);
        }
        else if (laborer.state === "Mining") {
            this.mining(laborer, myRoom, creep);
        }
        else { //Labor
            this.labor(laborer, myRoom, creep);
        }
    }
    static calculateCreepState(laborer, myRoom, creep) {
        if (laborer.state === "Labor" &&
            creep.carry.energy === 0) {
            const bank = global_functions_1.GlobalFunctions.getBank(myRoom);
            if (bank != null &&
                bank.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
                laborer.state = "PickupBank";
                creep.say("PickupBank");
                return;
            }
            else if (myRoom.roomStage >= 1) {
                for (let i = 0; i < myRoom.mySources.length; i++) {
                    const mySource = myRoom.mySources[i];
                    if (mySource.cache != null &&
                        mySource.cache.id != null) {
                        const cache = Game.getObjectById(mySource.cache.id);
                        if (cache == null) {
                            //Clear it
                            mySource.cache.id = null;
                            console.log("ERR: Source cache returned null with get by ID");
                        }
                        else if (cache.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
                            laborer.state = "PickupCache";
                            creep.say("PickupCache");
                            return;
                        }
                    }
                }
                //Couldn't find a cache to pickup from, Mine instead
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
    static pickupBank(laborer, myRoom, creep) {
        if (myRoom.bankPos == null) {
            console.log("ERR: Room's bank pos was null");
            return;
        }
        const bankPos = global_functions_1.GlobalFunctions.myPosToRoomPos(myRoom.bankPos);
        if (bankPos.isNearTo(creep)) {
            const bank = global_functions_1.GlobalFunctions.getBank(myRoom);
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
    static pickupCache(laborer, myRoom, creep) {
        const validCacheToGrabFrom = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY] >= creep.carryCapacity;
            }
        });
        if (validCacheToGrabFrom == null) {
            laborer.state = "Mining";
            creep.say("Mining");
        }
        else {
            if (validCacheToGrabFrom.pos.isNearTo(creep)) {
                creep.withdraw(validCacheToGrabFrom, RESOURCE_ENERGY);
            }
            else {
                creep.moveTo(validCacheToGrabFrom.pos);
            }
        }
    }
    static mining(laborer, myRoom, creep) {
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (source != null &&
            creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
    static labor(laborer, myRoom, creep) {
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
            const closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (closestConstructionSite != null) {
                givenCommand = true;
                if (creep.build(closestConstructionSite) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestConstructionSite);
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
exports.RoleLaborer = RoleLaborer;
