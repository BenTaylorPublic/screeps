import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RolePowerBankScavengeHaulCreep {
    public static run(powerBankScavengeHaul: PowerBankScavengeHaulCreep): void {
        const creep: Creep = Game.creeps[powerBankScavengeHaul.name];
        if (powerBankScavengeHaul.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            HelperFunctions.getCreepToRoom(creep, powerBankScavengeHaul, powerBankScavengeHaul.assignedRoomName);
        } else {
            if (powerBankScavengeHaul.state === "grabbing") {
                this.grabbing(creep, powerBankScavengeHaul);
            } else {
                this.depositing(creep, powerBankScavengeHaul);
            }
        }
    }

    private static grabbing(creep: Creep, powerBankScavengeHaul: PowerBankScavengeHaulCreep): void {

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
                HelperFunctions.myMoveTo(creep, powerBanks[0].pos, powerBankScavengeHaul);
            }
        } else {
            if (creep.store.getFreeCapacity() > 0) {
                //Need more
                //Should be resources on the ground
                const resources: Resource[] = creep.room.find(FIND_DROPPED_RESOURCES);
                if (resources.length === 0) {
                    Game.notify("No resources for a power scav hauler to pickup " + Game.time);
                    creep.say("dthb4dshnr");
                    creep.suicide();
                } else {
                    if (creep.pickup(resources[0]) === ERR_NOT_IN_RANGE) {
                        HelperFunctions.myMoveTo(creep, resources[0].pos, powerBankScavengeHaul);
                    }
                }
            } else {
                creep.say("depositing");
                powerBankScavengeHaul.state = "depositing";
                powerBankScavengeHaul.assignedRoomName = powerBankScavengeHaul.roomToDepositTo;
            }
        }
    }

    private static depositing(creep: Creep, powerBankScavengeHaul: PowerBankScavengeHaulCreep): void {
        if (creep.store.getUsedCapacity() === 0) {
            //All transferred
            creep.say("dthb4dshnr");
            creep.suicide();
        }

        const myRoom: MyRoom | null = HelperFunctions.getMyRoomByName(powerBankScavengeHaul.roomToDepositTo);
        if (myRoom == null) {
            ReportController.log("ERROR", "Room was null for a power scav hauler");
            return;
        }

        const bank: StructureStorage | null = myRoom.bank;
        if (bank == null) {
            ReportController.log("ERROR", "Bank was null for a power scav hauler");
            return;
        }

        if (creep.transfer(bank, RESOURCE_POWER) === ERR_NOT_IN_RANGE) {
            HelperFunctions.myMoveTo(creep, bank.pos, powerBankScavengeHaul);
        }
    }
}
