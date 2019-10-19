export class RoleAttackOneCreep {
    public static run(attackOneCreep: AttackOneCreep, attackOneState: string, rallyOrChargeFlag: Flag): void {
        const creep: Creep = Game.creeps[attackOneCreep.name];
        if (creep == null) {
            console.log("ERR: Attack One Creep is null. Creep ID: " + attackOneCreep.name);
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
                console.log("ERR: Claimer can't claim a room with no controller");
                return;
            }
            if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }*/
    }
}
