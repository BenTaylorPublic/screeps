import { globalFunctions } from "global.functions";

export const roleClaimer: any = {
    run: function (claimer: Claimer) {
        const creep: Creep = Game.creeps[claimer.name];
        if (creep == null) {
            console.log("ERR: Claimer creep is null. Creep ID: " + claimer.name);
            return;
        }
        const flagPos: RoomPosition = Game.flags[claimer.flagName].pos;

        if (flagPos.roomName !== creep.room.name) {
            //Not inside the room yet
            creep.moveTo(flagPos);
        } else {
            //Inside the room
            if (creep.room.controller == null) {
                console.log("ERR: Claimer can't claim a room with no controller");
                return;
            }
            if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }

    }
};
