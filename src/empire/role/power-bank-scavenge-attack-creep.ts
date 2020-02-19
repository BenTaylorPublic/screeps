import {HelperFunctions} from "../../global/helper-functions";

export class RolePowerBankScavengeAttackCreep {
    public static run(powerBankScavengeAttack: PowerBankScavengeAttackCreep): void {
        const creep: Creep = Game.creeps[powerBankScavengeAttack.name];
        if (powerBankScavengeAttack.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            HelperFunctions.getCreepToRoom(creep, powerBankScavengeAttack, powerBankScavengeAttack.assignedRoomName);
        } else {
            //Inside the room
            const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankScavengeAttack.powerBankId);
            if (powerBank == null) {
                //Kill the creep
                creep.say("dthb4dshnr");
                creep.suicide();
                return;
            }

            if (creep.pos.isNearTo(powerBank)) {
                creep.attack(powerBank);
                console.log("Heal result: " + creep.heal(creep));
            } else {
                HelperFunctions.myMoveTo(creep, powerBank);
            }
        }
    }
}
