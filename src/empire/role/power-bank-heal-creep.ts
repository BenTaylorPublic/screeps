import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {RoomHelper} from "../../global/helpers/room-helper";

export class RolePowerBankHealCreep {
    public static run(powerBankHeal: PowerBankHealCreep, myPowerBank: PowerBankDetails, powerBank: StructurePowerBank | null, powerBankAttack: PowerBankAttackCreep | null): void {

        if (CreepHelper.handleCreepPreRole(powerBankHeal)) {
            return;
        }

        const creep: Creep = Game.creeps[powerBankHeal.name];

        if (powerBank == null ||
            powerBankAttack == null) {
            //Kill the creep
            creep.say("dthb4dshnr");
            creep.suicide();
            return;
        }

        const attackCreep: Creep = Game.creeps[powerBankAttack.name];

        if (!powerBankHeal.reachedPowerBank) {
            //Still haven't reached the ideal location
            if (powerBankAttack.reachedPowerBank) {
                //Attacker in location, so that's good
                const idealPos: RoomPosition = RoomHelper.getPosOnOtherSide(powerBank.pos, attackCreep.pos);
                const idealPosTerrain: 0 | TERRAIN_MASK_WALL | TERRAIN_MASK_SWAMP = creep.room.getTerrain().get(idealPos.x, idealPos.y);
                if (idealPosTerrain === TERRAIN_MASK_WALL) {
                    //Fuck
                    //Just going to try get next to attack creep instead
                    if (creep.pos.isNearTo(attackCreep)) {
                        powerBankHeal.reachedPowerBank = true;
                    } else {
                        MovementHelper.myMoveTo(creep, attackCreep.pos, powerBankHeal);
                    }
                } else {
                    //Try get to the ideal position
                    if (RoomHelper.posMatches3(creep.pos, idealPos)) {
                        powerBankHeal.reachedPowerBank = true;
                    } else {
                        MovementHelper.myMoveTo(creep, idealPos, powerBankHeal);
                    }
                }
            } else {
                //Attack creep isn't in position yet, just move to the bank, if out of range of 5
                if (!creep.pos.inRangeTo(powerBank, 5)) {
                    MovementHelper.myMoveTo(creep, powerBank.pos, powerBankHeal);
                }
            }
        } else {
            //In position, just heal every tick
            creep.heal(attackCreep);
        }
    }
}
