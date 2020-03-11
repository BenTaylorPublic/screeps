import {Constants} from "../../global/constants";
import {HelperFunctions} from "../../global/helpers/helper-functions";

export class RoleAttackCreep {
    public static run(attackCreep: AttackPressureCreep | AttackQuickCreep, attackState: AttackStateType, rallyOrRoomTargetFlag: Flag, attackTarget: AttackTarget | null): void {
        if (HelperFunctions.handleCreepPreRole(attackCreep)) {
            return;
        }

        const creep: Creep = Game.creeps[attackCreep.name];

        if (attackState === "Rally" || attackState === "Conscripting") {
            //Get a nice tight ball on it
            HelperFunctions.myMoveTo(creep, rallyOrRoomTargetFlag.pos, attackCreep);
            if (!creep.pos.inRangeTo(rallyOrRoomTargetFlag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                creep.say("Moving");
            }
        } else if (attackState === "Charge") {
            this.attackLogic(creep, attackTarget, attackCreep);
        }
    }

    private static attackLogic(creep: Creep, attackTarget: AttackTarget | null, attackCreep: AttackPressureCreep | AttackQuickCreep): void {
        if (attackTarget == null) {
            creep.say("No target!");
        } else {
            creep.say("⚔️" + attackTarget.type);
            if (creep.pos.inRangeTo(attackTarget.roomObject.pos, 1)) {
                creep.attack(attackTarget.roomObject as Creep | Structure<StructureConstant>);
            } else {
                HelperFunctions.myMoveTo(creep, attackTarget.roomObject.pos, attackCreep);
            }
        }
    }
}