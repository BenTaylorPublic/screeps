import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";


export class RoleBankLinker {
    public static run(bankLinker: BankLinker, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(bankLinker)) {
            return;
        }

        const creep: Creep = Game.creeps[bankLinker.name];

        if (creep.store.getFreeCapacity() === 0) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.email("ERROR: Bank was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            if (creep.transfer(bank, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                MovementHelper.myMoveTo(creep, bank.pos, bankLinker);
            }
        } else {
            if (myRoom.bankLink == null ||
                myRoom.bankLink.id == null) {
                ReportController.email("ERROR: Bank Link was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            const link: StructureLink | null = Game.getObjectById(myRoom.bankLink.id);
            if (link == null) {
                ReportController.email("ERROR: Bank Link was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            if (link.store.energy > 0) {
                if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    MovementHelper.myMoveTo(creep, link.pos, bankLinker);
                }
            }
        }
    }
}
