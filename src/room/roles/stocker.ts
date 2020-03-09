import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RoleStocker {
    public static run(stocker: Stocker, myRoom: MyRoom): void {
        if (HelperFunctions.handleCreepPreRole(stocker)) {
            return;
        }

        const room: Room = Game.rooms[myRoom.name];
        const creep: Creep = Game.creeps[stocker.name];

        this.calculateCreepState(stocker, room, creep);

        if (stocker.state === "PickupEnergy") {
            this.pickupEnergy(stocker, myRoom, creep);
        } else if (stocker.state === "DistributeEnergy") {
            this.distributeEnergy(stocker, creep);
        } else if (stocker.state === "PickupResources") {
            this.pickupResources(stocker, creep);
        } else {
            this.depositResources(stocker, myRoom, creep);
        }
    }

    private static calculateCreepState(stocker: Stocker, room: Room, creep: Creep): void {
        if ((stocker.state === "DistributeEnergy" ||
            stocker.state === "DepositResources") &&
            creep.store.getUsedCapacity() === 0) {
            const structuresToAddTo: Structure[] = room.find(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER)
                        && structure.energy < structure.energyCapacity;
                }
            });
            if (structuresToAddTo.length > 0) {
                stocker.state = "PickupEnergy";
                creep.say("Pickup E");
            } else {
                //No structures to add to
                //Check for resources
                if (room.find(FIND_TOMBSTONES).length > 0 ||
                    room.find(FIND_DROPPED_RESOURCES).length > 0) {
                    stocker.state = "PickupResources";
                    creep.say("Pickup R");
                }
            }
        } else if (stocker.state === "PickupEnergy" &&
            creep.store.getFreeCapacity() === 0) {
            stocker.state = "DistributeEnergy";
            creep.say("Distribute");
        }
    }

    private static pickupEnergy(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bankPos == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                return;
            }
            if (bank.store.energy > 0) {
                creep.withdraw(bank, RESOURCE_ENERGY);
            }
        } else {
            HelperFunctions.myMoveTo(creep, bankPos, stocker);
        }
    }

    private static distributeEnergy(stocker: Stocker, creep: Creep): void {
        const structureToAddTo: Structure | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure: any) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER)
                    && structure.energy < structure.energyCapacity;
            }
        });
        if (structureToAddTo == null) {
            return;
        }
        if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            HelperFunctions.myMoveTo(creep, structureToAddTo.pos, stocker);
        }
    }

    private static pickupResources(stocker: Stocker, creep: Creep): void {
        if (creep.store.getFreeCapacity() === 0) {
            stocker.state = "DepositResources";
        }

        const resource: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (resource != null) {
            if (creep.pos.isNearTo(resource.pos)) {
                creep.pickup(resource);
            } else {
                HelperFunctions.myMoveTo(creep, resource.pos, stocker);
            }
            return;
        }

        const tombstone: Tombstone | null = creep.pos.findClosestByPath(FIND_TOMBSTONES);
        if (tombstone != null) {
            if (creep.pos.isNearTo(tombstone.pos)) {
                const resourcesInTombstone: ResourceConstant[] = Object.keys(tombstone.store) as ResourceConstant[];
                for (let i: number = 0; i < resourcesInTombstone.length; i++) {
                    creep.withdraw(tombstone, resourcesInTombstone[i]);
                }
            } else {
                HelperFunctions.myMoveTo(creep, tombstone.pos, stocker);
            }
            return;
        }

        //If it gets here, there are no resources or tombstones
        //Now it can swap the state to DepositResources
        stocker.state = "DepositResources";
    }

    private static depositResources(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bankPos == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                return;
            }
            const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
            for (let i: number = 0; i < resources.length; i++) {
                creep.transfer(bank, resources[i]);
            }
        } else {
            HelperFunctions.myMoveTo(creep, bankPos, stocker);
        }
    }
}
