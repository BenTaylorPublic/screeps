"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
class RoleHauler {
    static run(hauler, myRoom) {
        const creep = Game.creeps[hauler.name];
        if (creep == null) {
            console.log("ERR: Hauler creep is null. Creep ID: " + hauler.name);
            return;
        }
        if (hauler.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, hauler.assignedRoomName));
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
            const cacheToGrabFromPos = global_functions_1.GlobalFunctions.myPosToRoomPos(hauler.cachePosToPickupFrom);
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
            const bankPos = global_functions_1.GlobalFunctions.myPosToRoomPos(myRoom.bankPos);
            if (bankPos.isNearTo(creep)) {
                const bank = global_functions_1.GlobalFunctions.getBank(myRoom);
                if (bank == null) {
                    console.log("ERR: Room's bank was null");
                    return;
                }
                creep.transfer(bank, RESOURCE_ENERGY);
            }
            else {
                creep.moveTo(bankPos);
            }
        }
    }
}
exports.RoleHauler = RoleHauler;
