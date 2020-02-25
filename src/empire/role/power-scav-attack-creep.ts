import {HelperFunctions} from "../../global/helper-functions";

export class RolePowerScavAttackCreep {
    public static run(powerScavAttack: PowerScavAttackCreep, myPowerBank: PowerScavBank, powerBank: StructurePowerBank | null): void {

        if (HelperFunctions.handleCreepPreRole(powerScavAttack)) {
            return;
        }

        const creep: Creep = Game.creeps[powerScavAttack.name];

        if (powerBank == null) {
            //Kill the creep
            if (Game.time < myPowerBank.eol - 1) {
                myPowerBank.state = "dead";
                Game.notify("Power bank destroyed at " + Game.time);
            } else {
                Game.notify("Power bank EOL died at " + Game.time);
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
            HelperFunctions.myMoveTo(creep, powerBank.pos, powerScavAttack);
        }
    }
}
