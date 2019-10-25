import {ReportController} from "../../reporting/report-controller";
import {Constants} from "../../global/constants";

export class RoleAttackOneCreep {
    public static run(attackOneCreep: AttackOneCreep, attackOneState: AttackOneStateType, rallyOrRoomTargetFlag: Flag, attackTarget: AttackTarget | null): void {
        const creep: Creep = Game.creeps[attackOneCreep.name];
        if (creep == null) {
            ReportController.log("ERROR", "Attack One Creep is null. Creep ID: " + attackOneCreep.name);
            return;
        }

        if (attackOneState === "Rally" || attackOneState === "Conscripting") {
            if (!creep.pos.inRangeTo(rallyOrRoomTargetFlag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                creep.say("Moving");
                creep.moveTo(rallyOrRoomTargetFlag.pos);
                return;
            } else {
                //In range of rally flag, just wait
                creep.say("Rallying");
            }
        } else if (attackOneState === "Charge") {
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
            this.attackTarget(creep, attackTarget);
        }
    }


    private static attackTarget(creep: Creep, target: AttackTarget): void {
        creep.say("⚔️" + target.type);
        if (creep.pos.inRangeTo(target.pos, 1)) {
            creep.attack(target.roomObject);
        } else {
            creep.moveTo(target);
        }
    }
}
