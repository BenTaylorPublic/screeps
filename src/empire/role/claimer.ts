import {ReportController} from "../../reporting/report-controller";

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

            //TODO: Test if this works
            //TODO: if it does, try cache it in creep's memory
            const ret: PathFinderPath = PathFinder.search(creep.pos, flag.pos, {
                roomCallback(roomName: string): boolean {
                    return !Memory.myMemory.empire.avoidRooms.includes(roomName);
                }
            });

            creep.moveByPath(ret.path);
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
