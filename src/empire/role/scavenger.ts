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
                            const structures: AnyStoreStructure[] = creep.room.find<AnyStoreStructure>(FIND_HOSTILE_STRUCTURES, {
                                filter: (struc: AnyStructure) => {
                                    return RoomHelper.structureHasResources(struc);
                                }
                            });

                            if (structures.length === 0) {
                                returning = true;
                            }
                        }
                    }
                }
            }
            if (returning) {
                scavenger.state = "Returning";
                const closestBank: StructureStorage | null = MapHelper.findClosestBank(creep.room.name, 150_000);
                if (closestBank == null) {
                    ReportController.email("ERROR: closestBank was null in RoleScavenger.checkStates");
                    return;
                }
                scavenger.assignedRoomName = closestBank.room.name;
            }
        } else if (scavenger.state === "Returning") {
            if (creep.store.getUsedCapacity() === 0) {
                if (creep.ticksToLive != null &&
                    creep.ticksToLive >= scavenger.scavengeAgainWhenTtlAbove) {
                    scavenger.assignedRoomName = scavenger.scavengingRoomName;
                    scavenger.state = "Scavenging";
                } else {
                    creep.suicide();
                }
            }
        }
    }

    private static scavenging(scavenger: Scavenger, creep: Creep): void {
        if (scavenger.scavengeTargetPos == null) {
            const scavengerTargetResult: ScavengerTargetResult | null = this.getTarget(creep);
            if (scavengerTargetResult == null) {
                return;
            }
            scavenger.scavengeTargetPos = RoomHelper.roomPosToMyPos(scavengerTargetResult.pos);
        }
        const targetPos: RoomPosition = RoomHelper.myPosToRoomPos(scavenger.scavengeTargetPos);
        if (creep.pos.isNearTo(targetPos)) {
            //Grab it again and withdraw
            const scavengerTargetResult: ScavengerTargetResult | null = this.getTarget(creep);
            if (scavengerTargetResult == null) {
                return;
            }
            if (!RoomHelper.posMatches(targetPos, scavengerTargetResult.pos)) {
                scavenger.scavengeTargetPos = null;
                return;
            }
            if (scavengerTargetResult.isResource &&
                scavengerTargetResult.resource != null) {
                creep.pickup(scavengerTargetResult.resource);
            } else if (!scavengerTargetResult.isResource &&
                scavengerTargetResult.structure != null) {
                const resourcesInStructure: ResourceConstant[] = Object.keys(scavengerTargetResult.structure.store) as ResourceConstant[];
                for (let i: number = 0; i < resourcesInStructure.length; i++) {
                    creep.withdraw(scavengerTargetResult.structure, resourcesInStructure[i]);
                }
            }
        } else {
            MovementHelper.myMoveTo(creep, targetPos, scavenger);
        }
    }

    private static getTarget(creep: Creep): ScavengerTargetResult | null {
        const resource: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (resource != null) {
            return {
                isResource: true,
                resource: resource,
                pos: resource.pos,
                structure: null
            };
        }

        const tombstone: Tombstone | null = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (t: Tombstone) => {
                return t.store.getUsedCapacity() > 0;
            }
        });
        if (tombstone != null) {
            return {
                isResource: false,
                resource: null,
                pos: tombstone.pos,
                structure: tombstone
            };
        }

        const ruin: Ruin | null = creep.pos.findClosestByPath(FIND_RUINS, {
            filter: (t: Ruin) => {
                return t.store.getUsedCapacity() > 0;
            }
        });
        if (ruin != null) {
            return {
                isResource: false,
                resource: null,
                pos: ruin.pos,
                structure: ruin
            };
        }

        const structure: AnyStoreStructure | null = creep.pos.findClosestByPath<AnyStoreStructure>(FIND_HOSTILE_STRUCTURES, {
            filter: (struc: AnyStructure) => {
                return RoomHelper.structureHasResources(struc);
            }
        });
        if (structure != null) {
            return {
                isResource: false,
                resource: null,
                pos: structure.pos,
                structure: structure
            };
        }

        return null;
    }

    private static returning(scavenger: Scavenger, creep: Creep): void {
        const myRoom: MyRoom | null = RoomHelper.getMyRoomByName(scavenger.assignedRoomName);
        if (myRoom == null) {
            ReportController.email("ERROR: myRoom was null in RoleScavenger.returning");
            return;
        }
        if (myRoom.bank == null) {
            ReportController.email("ERROR: Scavenging deposit room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank.object;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            //It will only transfer one resource type per tick
            const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
            for (let i: number = 0; i < resources.length; i++) {
                if (creep.transfer(bank, resources[i]) === OK) {
                    break;
                }
            }
        } else {
            MovementHelper.myMoveTo(creep, bankPos, scavenger);
        }

    }
}