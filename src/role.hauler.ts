export const roleHauler: any = {
    run: function (hauler: Hauler) {
        const creep: Creep = Game.creeps[hauler.name];
        if (creep == null) {
            console.log("Hauler creep is null. Creep ID: " + hauler.name);
            return;
        }
        if (hauler.pickup === false &&
            creep.carry.energy === 0) {
            hauler.pickup = true;
            creep.say("pickup");
        } else if (hauler.pickup === true &&
            creep.carry.energy === creep.carryCapacity) {
            hauler.pickup = false;
            creep.say("delivering");
        }

        if (hauler.pickup) {
            //Picking up more
            const cacheToGrabFrom: StructureContainer | null =
                Game.getObjectById<StructureContainer>(hauler.cacheContainerIdToGrabFrom);
            if (cacheToGrabFrom == null) {
                console.log("CacheToGrabFrom was null for a hauler");
                return;
            }

            if (creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(cacheToGrabFrom);
            }
        } else {
            //Deliver
            const bankContainerToPutIn: StructureContainer | null =
                Game.getObjectById<StructureContainer>(hauler.bankContainerIdToPutIn);
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
