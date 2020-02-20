import {HelperFunctions} from "../../global/helper-functions";

export class RolePowerBankScavengeAttackCreep {
    public static run(powerBankScavengeAttack: PowerBankScavengeAttackCreep, bankEOL: number): void {
        const creep: Creep = Game.creeps[powerBankScavengeAttack.name];
        if (powerBankScavengeAttack.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            HelperFunctions.getCreepToRoom(creep, powerBankScavengeAttack, powerBankScavengeAttack.assignedRoomName);
        } else {
            //Inside the room
            const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankScavengeAttack.powerBankId);
            if (powerBank == null) {
                //Kill the creep
                if (Game.time < bankEOL - 1) {
                    Game.notify("Power bank destroyed at " + Game.time);
                } else {
                    Game.notify("Power bank EOL died at " + Game.time);
                }
                creep.say("dthb4dshnr");
                creep.suicide();

                return;
            }

            if (creep.pos.isNearTo(powerBank)) {
                if (Game.time % 2 === 0) {
                    creep.attack(powerBank);
                } else {
                    creep.heal(creep);
                }
            } else {
                HelperFunctions.myMoveTo(creep, powerBank);
            }
        }
    }
}
