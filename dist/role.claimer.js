"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleClaimer = {
    run: function (claimer) {
        const creep = Game.creeps[claimer.name];
        if (creep == null) {
            console.log("ERR: Claimer creep is null. Creep ID: " + claimer.name);
            return;
        }
        const flag = Game.flags[claimer.flagName];
        if (flag == null) {
            //Kill the creep
            creep.suicide();
        }
        const flagPos = flag.pos;
        if (flagPos.roomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, flagPos.roomName));
            return;
        }
        else {
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
