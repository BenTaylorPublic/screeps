import {Constants} from "../../global/constants/constants";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {CreepHelper} from "../../global/helpers/creep-helper";


export class RoleAttackCreep {
    public static run(attackCreep: AttackPressureCreep | AttackQuickCreep, attackState: AttackStateType, rallyOrRoomTargetFlag: Flag, attackTarget: AttackTarget | null): void {
        if (CreepHelper.handleCreepPreRole(attackCreep)) {
            return;
        }

        const creep: Creep = Game.creeps[attackCreep.name];

        if (attackState === "Rally" || attackState === "Conscripting") {
            //Get a nice tight ball on it
            MovementHelper.myMoveTo(creep, rallyOrRoomTargetFlag.pos, attackCreep);
            if (!creep.pos.inRangeTo(rallyOrRoomTargetFlag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                creep.say("Moving");
            }
        } else if (attackState === "Charge") {
            this.attackLogic(creep, attackTarget, attackCreep, rallyOrRoomTargetFlag);
        }
    }

    private static attackLogic(creep: Creep, attackTarget: AttackTarget | null, attackCreep: AttackPressureCreep | AttackQuickCreep, roomTargetFlag: Flag): void {
        if (attackTarget == null) {
            creep.say("No target!");
            MovementHelper.myMoveTo(creep, roomTargetFlag.pos, attackCreep);
        } else {
            creep.say("⚔️" + attackTarget.type);
            if (creep.pos.inRangeTo(attackTarget.roomObject.pos, 1)) {
                creep.attack(attackTarget.roomObject as Creep | Structure<StructureConstant>);
            } else {
                MovementHelper.myMoveTo(creep, attackTarget.roomObject.pos, attackCreep);
            }
        }
    }
}