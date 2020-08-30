import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RolePowerBankAttackCreep {
    public static run(powerBankAttack: PowerBankAttackCreep, myPowerBank: PowerBankDetails, powerBank: StructurePowerBank | null): void {

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
            if (creep.hits === creep.hitsMax) {
                creep.attack(powerBank);

                if (!powerBankAttack.reachedPowerBank) {
                    powerBankAttack.reachedPowerBank = true;
                }
            }
        } else {
            MovementHelper.myMoveTo(creep, powerBank.pos, powerBankAttack);
        }
    }
}
