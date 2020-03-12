import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {LogHelper} from "../../global/helpers/log-helper";

export class RoleClaimer {
    public static run(claimer: Claimer): void {
        const creep: Creep = Game.creeps[claimer.name];
        if (CreepHelper.handleCreepPreRole(claimer)) {
            return;
        }

        const flag: Flag = Game.flags[claimer.flagName];
        if (flag == null) {
            //Kill the creep
            creep.say("dthb4dshnr");
            creep.suicide();
            return;
        }

        if (creep.room.controller == null) {
            ReportController.email("ERROR: Claimer can't claim a room with no controller in " + LogHelper.roomNameAsLink(creep.room.name));
            return;
        }
        if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            MovementHelper.myMoveTo(creep, creep.room.controller.pos, claimer);
        }

    }
}
