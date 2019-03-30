"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleHauler = {
    run: function (hauler) {
        const creep = Game.creeps[hauler.name];
        if (creep == null) {
            console.log("Hauler creep is null. Creep ID: " + hauler.name);
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
            const cacheToGrabFrom = Game.getObjectById(hauler.cacheContainerIdToGrabFrom);
            if (cacheToGrabFrom == null) {
                console.log("CacheToGrabFrom was null for a hauler");
                return;
            }
            if (creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(cacheToGrabFrom);
            }
        }
        else {
            //Deliver
            const bankContainerToPutIn = Game.getObjectById(hauler.bankContainerIdToPutIn);
            if (bankContainerToPutIn == null) {
                console.log("bankContainerToPutIn was null for a hauler");
                return;
            }
            if (creep.transfer(bankContainerToPutIn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(bankContainerToPutIn);
            }
        }
    }
};
