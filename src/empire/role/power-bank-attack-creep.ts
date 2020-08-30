import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {ReportController} from "../../reporting/report-controller";

export class RolePowerBankAttackCreep {
    public static run(powerBankAttack: PowerBankAttackCreep, myPowerBank: PowerBankDetails, powerBank: StructurePowerBank | null): void {

        if (CreepHelper.handleCreepPreRole(powerBankAttack)) {
            return;
        }

        const creep: Creep = Game.creeps[powerBankAttack.name];

        if (powerBank == null) {
            //Kill the creep
            if (Game.time < myPowerBank.eol - 1) {
                ReportController.email("Power bank destroyed at " + Game.time);
            } else {
                ReportController.email("Power bank EOL died at " + Game.time);
            }
            creep.say("dthb4dshnr");
            creep.suicide();

            return;
        }

        if (creep.pos.isNearTo(powerBank)) {
            if (Game.time % 2 === 0) {
                creep.attack(powerBank);
            } else {
                creep.heal(creep);
            }
        } else {
            MovementHelper.myMoveTo(creep, powerBank.pos, powerBankAttack);
        }
    }
}
