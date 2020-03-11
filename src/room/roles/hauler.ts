import {HelperFunctions} from "../../global/helpers/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RoleHauler {
    public static run(hauler: Hauler, myRoom: MyRoom): void {
        if (HelperFunctions.handleCreepPreRole(hauler)) {
            return;
        }

        const creep: Creep = Game.creeps[hauler.name];

        if (hauler.pickup === false &&
            creep.store.energy === 0) {
            hauler.pickup = true;
            creep.say("pickup");
        } else if (hauler.pickup === true &&
            creep.store.energy === creep.store.getCapacity()) {
            hauler.pickup = false;
            creep.say("delivering");
        }

        if (hauler.pickup) {
            //Picking up more

            const cacheToGrabFromPos: RoomPosition = HelperFunctions.myPosToRoomPos(hauler.cachePosToPickupFrom);
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
                    ReportController.email("ERROR: Source cache is null for hauler: " + hauler.name + " in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    return;
                }
                if (cacheToGrabFrom.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity()) {
                    creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY);
                }
            } else {
                HelperFunctions.myMoveTo(creep, cacheToGrabFromPos, hauler);
            }
        } else {
            //Deliver

            if (myRoom.bankPos == null) {
                ReportController.email("ERROR: Room's bank pos was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                return;
            }

            const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);

            if (bankPos.isNearTo(creep)) {
                const bank: StructureStorage | null = myRoom.bank;
                if (bank == null) {
                    ReportController.email("ERROR: Room's bank was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    return;
                }
                creep.transfer(bank, RESOURCE_ENERGY);
            } else {
                HelperFunctions.myMoveTo(creep, bankPos, hauler);
            }
        }
    }
}
