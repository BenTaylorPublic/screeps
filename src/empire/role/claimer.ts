import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helper-functions";

export class RoleClaimer {
    public static run(claimer: Claimer): void {
        const creep: Creep = Game.creeps[claimer.name];
        if (HelperFunctions.handleCreepPreRole(claimer)) {
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
            ReportController.email("ERROR: Claimer can't claim a room with no controller in " + HelperFunctions.roomNameAsLink(creep.room.name));
            return;
        }
        if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            HelperFunctions.myMoveTo(creep, creep.room.controller.pos, claimer);
        }

    }
}
