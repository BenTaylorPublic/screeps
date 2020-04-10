import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {Constants} from "../../global/constants";

export class RoleStocker {
    public static run(stocker: Stocker, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(stocker)) {
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
        } else if (stocker.state === "DepositResources") {
            this.depositResources(stocker, myRoom, creep);
        } else {
            this.stockTerminalEnergy(stocker, creep);
        }
    }

    private static calculateCreepState(stocker: Stocker, room: Room, creep: Creep): void {
        if (stocker.state === "DistributeEnergy") {
            if (!this.structureNeedsEnergy(room)) {
                stocker.state = "DepositResources";
                creep.say("Deposit R");
            } else if (creep.store.getUsedCapacity() === 0) {
                stocker.state = "PickupEnergy";
                creep.say("Pickup E");
            }
        } else if (stocker.state === "PickupEnergy") {
            if (creep.store.getFreeCapacity() === 0) {
                if (this.structureNeedsEnergy(room)) {
                    stocker.state = "DistributeEnergy";
                    creep.say("Distribute");
                } else {
                    if (this.terminalNeedsEnergy(room)) {
                        stocker.state = "StockTerminalEnergy";
                        creep.say("StocTermEn");
                    } else {
                        stocker.state = "DepositResources";
                        creep.say("Deposit R");
                    }
                }
            }
        } else if (stocker.state === "DepositResources") {
            if (creep.store.getUsedCapacity() === 0) {
                if (this.structureNeedsEnergy(room)) {
                    stocker.state = "PickupEnergy";
                    creep.say("Pickup E");
                } else if (this.resourcesToPickup(room)) {
                    stocker.state = "PickupResources";
                    creep.say("Pickup R");
                } else if (this.terminalNeedsEnergy(room)) {
                    stocker.state = "PickupEnergy";
                    creep.say("Pickup E");
                }
            }
        } else if (stocker.state === "PickupResources") {
            if (!this.resourcesToPickup(room) ||
                creep.store.getFreeCapacity() === 0) {
                stocker.state = "DepositResources";
                creep.say("Deposit R");
            }
        } else if (stocker.state === "StockTerminalEnergy") {
            const terminalNeedsEnergy: boolean = this.terminalNeedsEnergy(room);
            if (creep.store.getUsedCapacity() === 0 ||
                !terminalNeedsEnergy) {
                if (this.structureNeedsEnergy(room)) {
                    stocker.state = "PickupEnergy";
                    creep.say("Pickup E");
                } else if (this.resourcesToPickup(room)) {
                    stocker.state = "PickupResources";
                    creep.say("Pickup R");
                } else if (terminalNeedsEnergy) {
                    stocker.state = "PickupEnergy";
                    creep.say("Pickup E");
                } else {
                    stocker.state = "DepositResources";
                    creep.say("Deposit R");
                }
            }
        }
    }

    private static pickupEnergy(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bankPos == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            if (bank.store.energy > 0) {
                creep.withdraw(bank, RESOURCE_ENERGY);
            }
        } else {
            MovementHelper.myMoveTo(creep, bankPos, stocker);
        }
    }

    private static distributeEnergy(stocker: Stocker, creep: Creep): void {
        let structureToAddTo: Structure | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure: any) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (structureToAddTo == null) {
            structureToAddTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType === STRUCTURE_TOWER)
                        && structure.energy < Constants.STOCK_TOWER_TO;
                }
            });
            if (structureToAddTo == null) {
                return;
            }
        }
        if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            MovementHelper.myMoveTo(creep, structureToAddTo.pos, stocker);
        }
    }

    private static pickupResources(stocker: Stocker, creep: Creep): void {

        const resource: Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (resource != null) {
            if (creep.pos.isNearTo(resource.pos)) {
                creep.pickup(resource);
            } else {
                MovementHelper.myMoveTo(creep, resource.pos, stocker);
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
                MovementHelper.myMoveTo(creep, tombstone.pos, stocker);
            }
            return;
        }
    }

    private static depositResources(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bankPos == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
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
            MovementHelper.myMoveTo(creep, bankPos, stocker);
        }
    }

    private static stockTerminalEnergy(stocker: Stocker, creep: Creep): void {
        const terminals: StructureTerminal[] | null = creep.room.find<StructureTerminal>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_TERMINAL;
            }
        });
        if (terminals.length === 0) {
            return;
        }
        const terminal: StructureTerminal = terminals[0];
        if (creep.transfer(terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            MovementHelper.myMoveTo(creep, terminal.pos, stocker);
        }
    }

    private static structureNeedsEnergy(room: Room): boolean {
        const structuresToAddTo: Structure[] = room.find(FIND_STRUCTURES, {
            filter: (structure: any) => {
                if (structure.structureType !== STRUCTURE_TOWER) {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN)
                        && structure.energy < structure.energyCapacity;

                } else {
                    return structure.energy < Constants.STOCK_TOWER_TO;
                }
            }
        });
        return structuresToAddTo.length > 0;
    }

    private static terminalNeedsEnergy(room: Room): boolean {
        const terminals: StructureTerminal[] | null = room.find<StructureTerminal>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_TERMINAL;
            }
        });
        return terminals.length === 1 &&
            terminals[0].store.getUsedCapacity(RESOURCE_ENERGY) < Constants.TERMINAL_GOAL_ENERGY;
    }

    private static resourcesToPickup(room: Room): boolean {
        return room.find(FIND_TOMBSTONES, {
                filter: (t: Tombstone) => {
                    return t.store.getUsedCapacity() > 0;
                }
            }).length > 0 ||
            room.find(FIND_DROPPED_RESOURCES).length > 0;

    }
}