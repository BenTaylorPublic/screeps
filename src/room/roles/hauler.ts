import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RoleHauler {
    public static run(hauler: Hauler, myRoom: MyRoom): void {
        const creep: Creep = Game.creeps[hauler.name];
        if (creep == null) {
            ReportController.log("ERROR", "Hauler creep is null. Creep ID: " + hauler.name);
            return;
        }

        if (hauler.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");

            HelperFunctions.getCreepToRoom(creep, hauler, hauler.assignedRoomName);
            return;
        }

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
                    ReportController.log("ERROR", "Source cache is null for hauler: " + hauler.name);
                    return;
                }

                creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY);
            } else {
                HelperFunctions.myMoveTo(creep, cacheToGrabFromPos);
            }
        } else {
            //Deliver

            if (myRoom.bankPos == null) {
                ReportController.log("ERROR", "Room's bank pos was null");
                return;
            }

            const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);

            if (bankPos.isNearTo(creep)) {
                const bank: StructureStorage | null = myRoom.bank;
                if (bank == null) {
                    ReportController.log("ERROR", "Room's bank was null");
                    return;
                }
                creep.transfer(bank, RESOURCE_ENERGY);
            } else {
                HelperFunctions.myMoveTo(creep, bankPos);
            }
        }
    }
}
