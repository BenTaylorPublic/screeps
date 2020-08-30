import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {ReportController} from "../../reporting/report-controller";

export class RolePowerBankAttackCreep {
    public static run(powerScavAttack: PowerBankAttackCreep, myPowerBank: PowerBankDetails, powerBank: StructurePowerBank | null): void {

        if (CreepHelper.handleCreepPreRole(powerScavAttack)) {
            return;
        }

        const creep: Creep = Game.creeps[powerScavAttack.name];

        if (powerBank == null) {
            //Kill the creep
            if (Game.time < myPowerBank.eol - 1) {
                myPowerBank.state = "dead";
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
            MovementHelper.myMoveTo(creep, powerBank.pos, powerScavAttack);
        }
    }
}
