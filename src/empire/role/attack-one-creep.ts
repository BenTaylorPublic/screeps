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
            //Get a nice tight ball on it
            creep.moveTo(rallyOrRoomTargetFlag.pos);
            if (!creep.pos.inRangeTo(rallyOrRoomTargetFlag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                creep.say("Moving");
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
        if (creep.name === "Creep30249") {
            console.log(JSON.stringify(attackTarget));
        }

        if (attackTarget == null) {
            creep.say("No target!");
        } else {
            creep.say("⚔️" + attackTarget.type);
            if (creep.pos.inRangeTo(attackTarget.pos, 1)) {
                console.log("Attacking");
                creep.attack(attackTarget.roomObject as Creep | Structure<StructureConstant>);
            } else {
                console.log("Moving");
                creep.moveTo(attackTarget.pos);
            }
        }
    }
}
