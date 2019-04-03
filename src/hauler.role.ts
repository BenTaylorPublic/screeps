export const haulerRole: any = {
    run: function (hauler: Hauler, myRoom: MyRoom) {
        const creep: Creep = Game.creeps[hauler.name];
        if (creep == null) {
            console.log("ERR: Hauler creep is null. Creep ID: " + hauler.name);
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
                console.log("ERR: CacheToGrabFrom was null for a hauler");
                return;
            }

            if (creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(cacheToGrabFrom);
            }
        } else {
            //Deliver
            let bankId: string | null = null;
            for (let i = 0; i < myRoom.myContainers.length; i++) {
                const myContainer: MyContainer = myRoom.myContainers[i];
                if (myContainer.role === "Bank") {
                    bankId = myContainer.id;
                }
            }

            if (bankId == null) {
                console.log("ERR: bankId was null");
                return;
            }

            const bankContainerToPutIn: StructureContainer | null =
                Game.getObjectById<StructureContainer>(bankId);
            if (bankContainerToPutIn == null) {
                console.log("ERR: bankContainer was null for a hauler");
                return;
            }
            if (creep.transfer(bankContainerToPutIn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(bankContainerToPutIn);
            }
        }
    }
};
