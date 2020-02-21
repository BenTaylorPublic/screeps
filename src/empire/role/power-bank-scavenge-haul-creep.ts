import {HelperFunctions} from "../../global/helper-functions";

export class RolePowerBankScavengeHaulCreep {
    public static run(powerBankScavengeHaul: PowerBankScavengeHaulCreep): void {
        const creep: Creep = Game.creeps[powerBankScavengeHaul.name];
        if (powerBankScavengeHaul.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            HelperFunctions.getCreepToRoom(creep, powerBankScavengeHaul, powerBankScavengeHaul.assignedRoomName);
        } else {
            //Inside the room
            const powerBanks: StructurePowerBank[] = creep.room.find<StructurePowerBank>(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        return structure.structureType === STRUCTURE_POWER_BANK;
                    }
                }
            );
            if (powerBanks.length === 1) {
                //Power bank is still alive
                if (creep.pos.getRangeTo(powerBanks[0]) > 3) {
                    //Walk near it
                    HelperFunctions.myMoveTo(creep, powerBanks[0]);
                }
            } else {
                //@ts-ignore
                if (creep.store.getFreeCapacity > 0) {
                    //Need more
                    //Should be resources on the ground
                    const resources: Resource[] = creep.room.find(FIND_DROPPED_RESOURCES);
                    if (resources.length === 0) {
                        Game.notify("No resources for a power scav hauler to pickup " + Game.time);
                        creep.say("dthb4dshnr");
                        creep.suicide();
                    } else {
                        if (creep.pickup(resources[0]) === ERR_NOT_IN_RANGE) {
                            HelperFunctions.myMoveTo(creep, resources[0]);
                        }
                    }
                } else {
                    creep.say("deposit");
                    creep.suicide();
                }
            }
        }
    }
}
