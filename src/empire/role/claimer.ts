import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helper-functions";

export class RoleClaimer {
    public static run(claimer: Claimer): void {
        const creep: Creep = Game.creeps[claimer.name];
        if (creep == null) {
            ReportController.log("ERROR", "Claimer creep is null. Creep ID: " + claimer.name);
            return;
        }
        const flag: Flag = Game.flags[claimer.flagName];
        if (flag == null) {
            //Kill the creep
            creep.say("dthb4dshnr");
            creep.suicide();
            return;
        }

        if (claimer.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");

            //Set if needed, or every 50 ticks
            if (claimer.interRoomTravelPath == null ||
                Game.time % 50 === 0) {
                claimer.interRoomTravelPath = HelperFunctions.getInterRoomTravelPath(creep.pos, flag.pos);
            }

            if (creep.moveByPath(claimer.interRoomTravelPath) === OK) {
                claimer.interRoomTravelPath.splice(0, 1);
            } else {
                claimer.interRoomTravelPath = HelperFunctions.getInterRoomTravelPath(creep.pos, flag.pos);
            }

            return;
        } else {
            //Inside the room
            if (creep.room.controller == null) {
                ReportController.log("ERROR", "Claimer can't claim a room with no controller");
                return;
            }
            if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
}
