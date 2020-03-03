import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RoleStocker {
    public static run(stocker: Stocker, myRoom: MyRoom): void {
        if (HelperFunctions.handleCreepPreRole(stocker)) {
            return;
        }

        const creep: Creep = Game.creeps[stocker.name];

        this.calculateCreepState(stocker, myRoom, creep);

        if (stocker.state === "Pickup") {
            this.pickup(stocker, myRoom, creep);
        } else {
            this.distribute(stocker, creep);
        }
    }

    private static calculateCreepState(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (stocker.state === "Distribute" &&
            creep.store.energy === 0) {
            stocker.state = "Pickup";
            creep.say("pickup");
        } else if (creep.store.getFreeCapacity() === 0) {
            stocker.state = "Distribute";
            creep.say("work work");
        }
    }


    private static pickup(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bankPos == null) {
            ReportController.log("ERROR", "Room's bank pos was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.log("ERROR", "Room's bank was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                return;
            }
            if (bank.store.energy > 0) {
                creep.withdraw(bank, RESOURCE_ENERGY);
            }
        } else {
            HelperFunctions.myMoveTo(creep, bankPos, stocker);
        }
    }

    private static distribute(stocker: Stocker, creep: Creep): void {
        const structureToAddTo: Structure | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure: any) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER)
                    && structure.energy < structure.energyCapacity;
            }
        });
        if (structureToAddTo != null) {
            if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                HelperFunctions.myMoveTo(creep, structureToAddTo.pos, stocker);
            }
        }
    }
}
