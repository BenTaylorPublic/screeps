import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helper-functions";

export class RoleBankLinker {
    public static run(bankLinker: BankLinker, myRoom: MyRoom): void {
        const creep: Creep = Game.creeps[bankLinker.name];
        if (creep == null) {
            ReportController.log("ERROR", "BankLinker creep is null. Creep ID: " + bankLinker.name);
            return;
        }

        if (bankLinker.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");

            HelperFunctions.getCreepToRoom(creep, bankLinker, bankLinker.assignedRoomName);
            return;
        }

        if (creep.store.getFreeCapacity() === 0) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.log("ERROR", "Bank was null for a bank linker");
                return;
            }

            if (creep.transfer(bank, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                HelperFunctions.myMoveTo(creep, bank);
            }
        } else {
            if (myRoom.bankLink == null ||
                myRoom.bankLink.id == null) {
                ReportController.log("ERROR", "Bank Link was null for a bank linker");
                return;
            }
            const link: StructureLink | null = Game.getObjectById(myRoom.bankLink.id);
            if (link == null) {
                ReportController.log("ERROR", "Bank Link was null for a bank linker");
                return;
            }

            if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                HelperFunctions.myMoveTo(creep, link);
            }
        }
    }
}
