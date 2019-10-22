import {ReportController} from "../../reporting/report-controller";

export class RoleAttackOneCreep {
    public static run(attackOneCreep: AttackOneCreep, attackOneState: AttackOneStateType, rallyOrRoomTargetFlag: Flag): void {
        const creep: Creep = Game.creeps[attackOneCreep.name];
        if (creep == null) {
            ReportController.log("ERROR", "Attack One Creep is null. Creep ID: " + attackOneCreep.name);
            return;
        }
        //TODO: Continue from here
        /*
        if (claimer.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(flag.pos);
            return;
        } else {
            //Inside the room
            if (creep.room.controller == null) {
                ReportController.log("ERROR",  "Claimer can't claim a room with no controller");
                return;
            }
            if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }*/
    }
}
