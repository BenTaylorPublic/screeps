import { GlobalFunctions } from "global.functions";

export class RoleHauler {
    public static run(hauler: Hauler, myRoom: MyRoom) {
        const creep: Creep = Game.creeps[hauler.name];
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
        } else if (hauler.pickup === true &&
            creep.carry.energy === creep.carryCapacity) {
            hauler.pickup = false;
            creep.say("delivering");
        }

        if (hauler.pickup) {
            //Picking up more

            const cacheToGrabFromPos: RoomPosition = GlobalFunctions.myPosToRoomPos(hauler.cachePosToPickupFrom);
            if (cacheToGrabFromPos.isNearTo(creep)) {

                let cacheToGrabFrom: StructureContainer | null = null;

                const structures: Structure<StructureConstant>[] = cacheToGrabFromPos.lookFor(LOOK_STRUCTURES);
                for (let i = 0; i < structures.length; i++) {
                    const structure: Structure = structures[i];
                    if (structure.structureType === STRUCTURE_CONTAINER) {
                        cacheToGrabFrom = structure as StructureContainer;
                    }
                }

                if (cacheToGrabFrom == null) {
                    console.log("ERR: Source cache is null for hauler: " + hauler.name);
                    return;
                }

                creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY);
            } else {
                creep.moveTo(cacheToGrabFromPos);
            }
        } else {
            //Deliver

            if (myRoom.bankPos == null) {
                console.log("ERR: Room's bank pos was null");
                return;
            }

            const bankPos: RoomPosition = GlobalFunctions.myPosToRoomPos(myRoom.bankPos);

            if (bankPos.isNearTo(creep)) {
                const bank: StructureStorage | null = myRoom.bank;
                if (bank == null) {
                    console.log("ERR: Room's bank was null");
                    return;
                }
                creep.transfer(bank, RESOURCE_ENERGY);
            } else {
                creep.moveTo(bankPos);
            }
        }
    }
}
