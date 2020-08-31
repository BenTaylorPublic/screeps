import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {ReportController} from "../../reporting/report-controller";

export class RolePowerBankAttackCreep {
    public static run(powerBankAttack: PowerBankAttackCreep, myPowerBank: PowerBankDetails, powerBank: StructurePowerBank | null, powerBankHeal: PowerBankHealCreep | null): void {

        if (CreepHelper.handleCreepPreRole(powerBankAttack)) {
            return;
        }

        const creep: Creep = Game.creeps[powerBankAttack.name];

        if (powerBank == null) {
            //Kill the creep
            creep.say("dthb4dshnr");
            creep.suicide();
            return;
        }

        if (creep.pos.isNearTo(powerBank)) {
            //Attack when full health or the healer is dead
            if (creep.hits === creep.hitsMax ||
                powerBankHeal == null) {
                creep.attack(powerBank);

                if (!powerBankAttack.reachedPowerBank) {
                    ReportController.log("Power Bank Attack Creep reached power bank");
                    powerBankAttack.reachedPowerBank = true;
                }
            }
        } else {
            MovementHelper.myMoveTo(creep, powerBank.pos, powerBankAttack);
        }
    }
}
