import {ReportController} from "../reporting/report-controller";
import {HelperFunctions} from "../global/helper-functions";
import {ReportCooldownConstants} from "../global/report-cooldown-constants";

export class RoomDefenseController {
    public static run(myRoom: MyRoom, room: Room): void {
        if (Game.time % 100 !== 0) {
            return;
        }

        const nukes: Nuke[] = room.find(FIND_NUKES);
        if (nukes.length > 0) {
            //uh o
            const landingTime: number = Game.time + nukes[0].timeToLand;
            ReportController.email("NUKE DETECTED in " + HelperFunctions.roomNameAsLink(myRoom.name) + " will land in tick: " + landingTime,
                ReportCooldownConstants.DAY);
        }
    }
}
