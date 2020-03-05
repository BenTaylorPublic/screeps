import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RolePowerScavHaulCreep {
    public static run(powerScavHaul: PowerScavHaulCreep): void {
        if (HelperFunctions.handleCreepPreRole(powerScavHaul)) {
            return;
        }

        const creep: Creep = Game.creeps[powerScavHaul.name];
        if (powerScavHaul.state === "grabbing") {
            this.grabbing(creep, powerScavHaul);
        } else {
            this.depositing(creep, powerScavHaul);
        }
    }

    private static grabbing(creep: Creep, powerScavHaul: PowerScavHaulCreep): void {

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
                HelperFunctions.myMoveTo(creep, powerBanks[0].pos, powerScavHaul);
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
                        HelperFunctions.myMoveTo(creep, resources[0].pos, powerScavHaul);
                    }
                }
            } else {
                creep.say("depositing");
                powerScavHaul.state = "depositing";
                powerScavHaul.assignedRoomName = powerScavHaul.roomToDepositTo;
            }
        }
    }

    private static depositing(creep: Creep, powerScavHaul: PowerScavHaulCreep): void {
        if (creep.store.getUsedCapacity() === 0) {
            //All transferred
            creep.say("dthb4dshnr");
            creep.suicide();
        }

        const myRoom: MyRoom | null = HelperFunctions.getMyRoomByName(powerScavHaul.roomToDepositTo);
        if (myRoom == null) {
            ReportController.email("ERROR: Room was null for a power scav hauler " + HelperFunctions.roomNameAsLink(powerScavHaul.roomToDepositTo));
            return;
        }

        const bank: StructureStorage | null = myRoom.bank;
        if (bank == null) {
            ReportController.email("ERROR: Bank was null for a power scav hauler in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }

        if (creep.transfer(bank, RESOURCE_POWER) === ERR_NOT_IN_RANGE) {
            HelperFunctions.myMoveTo(creep, bank.pos, powerScavHaul);
        }
    }
}
