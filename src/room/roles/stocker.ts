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
        let considerResources: boolean = false;
        let considerEnergy: boolean = false;
        if (stocker.state === "DistributeEnergy") {
            const structuresToAddTo: Structure[] = room.find(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER)
                        && structure.energy < structure.energyCapacity;
                }
            });
            if (structuresToAddTo.length > 0) {
                if (creep.store.getUsedCapacity() === 0) {
                    stocker.state = "PickupEnergy";
                    creep.say("Pickup E");
                }
            } else {
                considerResources = true;
            }
        } else if (stocker.state === "PickupEnergy") {
            if (creep.store.getFreeCapacity() === 0) {
                stocker.state = "DistributeEnergy";
                creep.say("Distribute");
            }
        } else if (stocker.state === "DepositResources") {
            if (creep.store.getUsedCapacity() === 0) {
                considerEnergy = true;
                considerResources = true;
            }
        } else if (stocker.state === "PickupResources") {
            if (creep.store.getFreeCapacity() === 0 ||
                (room.find(FIND_TOMBSTONES, {
                        filter: (t: Tombstone) => {
                            return t.store.getUsedCapacity() > 0;
                        }
                    }).length === 0 &&
                    room.find(FIND_DROPPED_RESOURCES).length === 0)) {
                if (creep.store.getUsedCapacity() === 0) {
                    considerEnergy = true;
                } else {
                    stocker.state = "DepositResources";
                    creep.say("Deposit R");
                }
            }
        }

        if (considerEnergy) {
            const structuresToAddTo: Structure[] = room.find(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER)
                        && structure.energy < structure.energyCapacity;
                }
            });
            if (structuresToAddTo.length > 0) {
                if (creep.store.getFreeCapacity() !== 0) {
                    stocker.state = "PickupEnergy";
                    creep.say("Pickup E");
                    return;
                }
            }
        }

        if (considerResources) {
            if (room.find(FIND_TOMBSTONES, {
                    filter: (t: Tombstone) => {
                        return t.store.getUsedCapacity() > 0;
                    }
                }).length > 0 ||
                room.find(FIND_DROPPED_RESOURCES).length > 0) {
                if (creep.store.getUsedCapacity() !== 0) {
                    stocker.state = "DepositResources";
                    creep.say("Deposit R");
                } else {
                    stocker.state = "PickupResources";
                    creep.say("Pickup R");
                }
            }
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

        const resource: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (resource != null) {
            if (creep.pos.isNearTo(resource.pos)) {
                creep.pickup(resource);
            } else {
                HelperFunctions.myMoveTo(creep, resource.pos, stocker);
            }
            return;
        }

        const tombstone: Tombstone | null = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (t: Tombstone) => {
                return t.store.getUsedCapacity() > 0;
            }
        });
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
