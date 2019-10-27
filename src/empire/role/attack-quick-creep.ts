import {ReportController} from "../../reporting/report-controller";
import {Constants} from "../../global/constants";

export class RoleAttackQuickCreep {
    public static run(attackQuickCreep: AttackQuickCreep, attackQuickState: AttackQuickStateType, rallyOrRoomTargetFlag: Flag, attackTarget: AttackTarget | null): void {
        const creep: Creep = Game.creeps[attackQuickCreep.name];
        if (creep == null) {
            ReportController.log("ERROR", "Attack Quick Creep is null. Creep ID: " + attackQuickCreep.name);
            return;
        }

        if (attackQuickState === "Rally" || attackQuickState === "Conscripting") {
            //Get a nice tight ball on it
            creep.moveTo(rallyOrRoomTargetFlag.pos);
            if (!creep.pos.inRangeTo(rallyOrRoomTargetFlag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                creep.say("Moving");
            } else {
                //In range of rally flag, just wait
                creep.say("Rallying");
            }
        } else if (attackQuickState === "Charge") {
            if (creep.room.name !== rallyOrRoomTargetFlag.pos.roomName) {
                creep.say("Charge!");
                creep.moveTo(rallyOrRoomTargetFlag.pos);
            } else {
                //In the target room!
                this.attackLogic(creep, attackTarget);
            }
        }
    }

    private static attackLogic(creep: Creep, attackTarget: AttackTarget | null): void {
        if (attackTarget == null) {
            creep.say("No target!");
        } else {
            creep.say("⚔️" + attackTarget.type);
            if (creep.pos.inRangeTo(attackTarget.roomObject.pos, 1)) {
                creep.attack(attackTarget.roomObject as Creep | Structure<StructureConstant>);
            } else {
                creep.moveTo(attackTarget.roomObject.pos);
            }
        }
    }
}
