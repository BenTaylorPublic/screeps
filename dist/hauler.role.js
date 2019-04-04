"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haulerRole = {
    run: function (hauler, myRoom) {
        const creep = Game.creeps[hauler.name];
        if (creep == null) {
            console.log("ERR: Hauler creep is null. Creep ID: " + hauler.name);
            return;
        }
        if (hauler.pickup === false &&
            creep.carry.energy === 0) {
            hauler.pickup = true;
            creep.say("pickup");
        }
        else if (hauler.pickup === true &&
            creep.carry.energy === creep.carryCapacity) {
            hauler.pickup = false;
            creep.say("delivering");
        }
        if (hauler.pickup) {
            //Picking up more
            const cacheToGrabFromPos = new RoomPosition(hauler.cachePosToPickupFrom.x, hauler.cachePosToPickupFrom.y, hauler.cachePosToPickupFrom.roomName);
            if (cacheToGrabFromPos.isNearTo(creep)) {
                let cacheToGrabFrom = null;
                const structures = cacheToGrabFromPos.lookFor(LOOK_STRUCTURES);
                for (let i = 0; i < structures.length; i++) {
                    const structure = structures[i];
                    if (structure.structureType === STRUCTURE_CONTAINER) {
                        cacheToGrabFrom = structure;
                    }
                }
                if (cacheToGrabFrom == null) {
                    console.log("ERR: Source cache is null for hauler: " + hauler.name);
                    return;
                }
                creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY);
            }
            else {
                creep.moveTo(cacheToGrabFromPos);
            }
        }
        else {
            //Deliver
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
                    console.log("ERR: Bank is null for hauler: " + hauler.name);
                    return;
                }
                creep.transfer(bank, RESOURCE_ENERGY);
            }
            else {
                creep.moveTo(bankPos);
            }
        }
    }
};
