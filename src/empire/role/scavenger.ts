import {CreepHelper} from "../../global/helpers/creep-helper";
import {MapHelper} from "../../global/helpers/map-helper";
import {ReportController} from "../../reporting/report-controller";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";

export class RoleScavenger {
    public static run(scavenger: Scavenger): void {
        if (CreepHelper.handleCreepPreRole(scavenger)) {
            return;
        }
        const creep: Creep = Game.creeps[scavenger.name];
        this.checkStates(scavenger, creep);
        if (scavenger.state === "Scavenging") {
            this.scavenging(scavenger, creep);
        } else {
            this.returning(scavenger, creep);
        }
    }

    private static checkStates(scavenger: Scavenger, creep: Creep): void {
        if (scavenger.state === "Scavenging") {
            let returning: boolean = false;
            if (creep.store.getFreeCapacity() === 0) {
                returning = true;
            } else {
                const resources: Resource[] = creep.room.find(FIND_DROPPED_RESOURCES);
                if (resources.length === 0) {
                    const tombstones: Tombstone[] = creep.room.find(FIND_TOMBSTONES, {
                        filter: (t: Tombstone) => {
                            return t.store.getUsedCapacity() > 0;
                        }
                    });
                    if (tombstones.length === 0) {
                        const ruins: Ruin[] = creep.room.find(FIND_RUINS, {
                            filter: (t: Ruin) => {
                                return t.store.getUsedCapacity() > 0;
                            }
                        });
                        if (ruins.length === 0) {
                            returning = true;

                            // const structures: AnyStoreStructure[] = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                            //     filter: (struc: AnyStructure) => {
                            //         if (struc.structureType === STRUCTURE_EXTENSION ||
                            //             struc.structureType === STRUCTURE_FACTORY ||
                            //             // struc.structureType === STRUCTURE_LAB ||
                            //             struc.structureType === STRUCTURE_LINK //||
                            //             // struc.structureType === STRUCTURE_NUKER ||
                            //             // struc.structureType === STRUCTURE_POWER_SPAWN ||
                            //             // struc.structureType === STRUCTURE_SPAWN ||
                            //             // struc.structureType === STRUCTURE_STORAGE ||
                            //             // struc.structureType === STRUCTURE_TERMINAL ||
                            //             // struc.structureType === STRUCTURE_TOWER ||
                            //             // struc.structureType === STRUCTURE_CONTAINER
                            //         ) {
                            //             if (struc.structureType === STRUCTURE_FACTORY) {
                            //                 return struc.store.getUsedCapacity() > 0;
                            //             }
                            //             // return struc.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                            //             return false;
                            //         } else {
                            //             return false;
                            //         }
                            //     }
                            // });
                        }
                    }
                }
            }
            if (returning) {
                scavenger.state = "Returning";
                const closestBank: StructureStorage | null = MapHelper.findClosestBank(creep.room.name, creep.store.getUsedCapacity());
                if (closestBank == null) {
                    ReportController.email("ERROR: closestBank was null in RoleScavenger.checkStates");
                    return;
                }
                scavenger.assignedRoomName = closestBank.room.name;
            }
        } else if (scavenger.state === "Returning") {
            if (creep.store.getUsedCapacity() === 0) {
                creep.suicide();
            }
        }
    }

    private static scavenging(scavenger: Scavenger, creep: Creep): void {
        const resource: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (resource != null) {
            if (creep.pos.isNearTo(resource.pos)) {
                creep.pickup(resource);
            } else {
                MovementHelper.myMoveTo(creep, resource.pos, scavenger);
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
                MovementHelper.myMoveTo(creep, tombstone.pos, scavenger);
            }
            return;
        }

        const ruin: Ruin | null = creep.pos.findClosestByPath(FIND_RUINS, {
            filter: (t: Ruin) => {
                return t.store.getUsedCapacity() > 0;
            }
        });
        if (ruin != null) {
            if (creep.pos.isNearTo(ruin.pos)) {
                const resourcesInRuin: ResourceConstant[] = Object.keys(ruin.store) as ResourceConstant[];
                for (let i: number = 0; i < resourcesInRuin.length; i++) {
                    creep.withdraw(ruin, resourcesInRuin[i]);
                }
            } else {
                MovementHelper.myMoveTo(creep, ruin.pos, scavenger);
            }
            return;
        }
    }

    private static returning(scavenger: Scavenger, creep: Creep): void {
        const myRoom: MyRoom | null = RoomHelper.getMyRoomByName(scavenger.assignedRoomName);
        if (myRoom == null) {
            ReportController.email("ERROR: myRoom was null in RoleScavenger.returning");
            return;
        }
        if (myRoom.bankPos == null) {
            ReportController.email("ERROR: Scavenging deposit room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            //It will only transfer one resource type per tick
            const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
            for (let i: number = 0; i < resources.length; i++) {
                creep.transfer(bank, resources[i]);
            }
        } else {
            MovementHelper.myMoveTo(creep, bankPos, scavenger);
        }

    }
}