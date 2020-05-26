import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {Constants} from "../../global/constants/constants";

export class RoleStocker {
    public static run(stocker: Stocker, myRoom: MyRoom, labOrder: LabOrder | null): void {
        if (CreepHelper.handleCreepPreRole(stocker)) {
            return;
        }

        const room: Room = Game.rooms[myRoom.name];
        const creep: Creep = Game.creeps[stocker.name];

        this.calculateCreepState(stocker, room, creep, labOrder);

        if (stocker.state === "PickupEnergy") {
            this.pickupEnergy(stocker, myRoom, creep);
        } else if (stocker.state === "DistributeEnergy") {
            this.distributeEnergy(stocker, creep);
        } else if (stocker.state === "PickupResources") {
            this.pickupResources(stocker, creep);
        } else if (stocker.state === "PickupReagents") {
            this.pickupReagents(stocker, myRoom, creep, labOrder as LabOrder);
        } else if (stocker.state === "DepositReagents") {
            this.depositReagents(stocker, myRoom, creep, labOrder as LabOrder);
        } else if (stocker.state === "PickupCompounds") {
            this.pickupCompounds(stocker, myRoom, creep, labOrder as LabOrder);
        } else {
            this.depositResources(stocker, myRoom, creep);
        }
    }

    private static calculateCreepState(stocker: Stocker, room: Room, creep: Creep, labOrder: LabOrder | null): void {
        if (stocker.state === "DistributeEnergy") {
            if (!this.structureNeedsEnergy(room) &&
                (this.resourcesToPickup(room) ||
                    this.labOrderToLoadFor(labOrder) ||
                    this.labOrderToUnloadFor(labOrder))) {
                stocker.state = "DepositResources";
                creep.say("💎/⚡ to 🏦");
            } else if (creep.store.getUsedCapacity() === 0) {
                stocker.state = "PickupEnergy";
                creep.say("⚡ from 🏦");
            }
        } else if (stocker.state === "PickupEnergy") {
            if (creep.store.getFreeCapacity() === 0) {
                if (this.structureNeedsEnergy(room)) {
                    stocker.state = "DistributeEnergy";
                    creep.say("Distribute ⚡");
                } else {
                    stocker.state = "DepositResources";
                    creep.say("💎/⚡ to 🏦");
                }
            }
        } else if (stocker.state === "DepositResources") {
            if (creep.store.getUsedCapacity() === 0) {
                if (this.structureNeedsEnergy(room)) {
                    stocker.state = "PickupEnergy";
                    creep.say("⚡ from 🏦");
                } else if (this.labOrderToLoadFor(labOrder)) {
                    stocker.state = "PickupReagents";
                    creep.say("🧪 from 🏦");
                } else if (this.labOrderToUnloadFor(labOrder)) {
                    stocker.state = "PickupCompounds";
                    creep.say("Pickup ⚗");
                } else if (this.resourcesToPickup(room)) {
                    stocker.state = "PickupResources";
                    creep.say("💎 from 🏦");
                }
            }
        } else if (stocker.state === "PickupResources") {
            if (!this.resourcesToPickup(room) ||
                creep.store.getFreeCapacity() === 0) {
                stocker.state = "DepositResources";
                creep.say("💎/⚡ to 🏦");
            }
        } else if (stocker.state === "PickupReagents") {
            if (labOrder == null) {
                stocker.state = "DepositResources";
                creep.say("💎/⚡ to 🏦");
            } else if (creep.store.getUsedCapacity(labOrder.reagent1) > 0 &&
                creep.store.getUsedCapacity(labOrder.reagent2) > 0) {
                stocker.state = "DepositReagents";
                creep.say("🧪 to 🔬");
            }
        } else if (stocker.state === "DepositReagents") {
            if (labOrder == null ||
                creep.store.getUsedCapacity() === 0) {
                stocker.state = "DepositResources";
                creep.say("💎/⚡ to 🏦");
            }
        } else if (stocker.state === "PickupCompounds") {
            if (labOrder == null ||
                creep.store.getFreeCapacity() === 0 ||
                !this.labOrderToUnloadFor(labOrder)) {
                stocker.state = "DepositResources";
                creep.say("💎/⚡ to 🏦");
            }
        }
    }

    private static pickupCompounds(stocker: Stocker, myRoom: MyRoom, creep: Creep, labOrder: LabOrder): void {
        const labMemory: LabMemory = myRoom.labs as LabMemory;
        //Loop until successfully withdraw
        let moved: boolean = false;
        for (let i: number = 0; i < labMemory.compoundLabs.length; i++) {
            const compoundLabMemory: CompoundLabMemory = labMemory.compoundLabs[i];
            const lab: StructureLab | null = Game.getObjectById<StructureLab>(compoundLabMemory.id);
            if (lab == null) {
                ReportController.email("ERROR: A compound lab was null in pickupCompounds in " + LogHelper.roomNameAsLink(myRoom.name));
                continue;
            }
            if (lab.store.getUsedCapacity() === 0) {
                continue;
            }

            const resources: ResourceConstant[] = Object.keys(lab.store) as ResourceConstant[];
            if (resources.length > 0) {
                const result: ScreepsReturnCode = creep.withdraw(lab, resources[0]);
                if (result === OK) {
                    if (moved) {
                        creep.cancelOrder("move");
                        return;
                    }
                } else if (result === ERR_NOT_IN_RANGE &&
                    !moved) {
                    moved = true;
                    MovementHelper.myMoveTo(creep, lab.pos, stocker);
                }
            }
        }
    }

    private static depositReagents(stocker: Stocker, myRoom: MyRoom, creep: Creep, labOrder: LabOrder): void {
        const reagentLab1: StructureLab | null = Game.getObjectById<StructureLab>((myRoom.labs as LabMemory).reagentLab1.id);
        const reagentLab2: StructureLab | null = Game.getObjectById<StructureLab>((myRoom.labs as LabMemory).reagentLab2.id);
        if (reagentLab1 == null || reagentLab2 == null) {
            ReportController.email("ERROR: A reagent lab was null in stocker.depositReagents in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        const depositingReagent1: boolean = Object.keys(creep.store).length === 2;
        const targetLab: StructureLab = depositingReagent1 ? reagentLab1 : reagentLab2;
        if (creep.pos.isNearTo(targetLab)) {
            //Deposit
            const resourceToDeposit: MineralsAndCompoundConstant = depositingReagent1 ? labOrder.reagent1 : labOrder.reagent2;
            creep.transfer(targetLab, resourceToDeposit);
            if (!depositingReagent1) {
                //Just deposited reagent 2
                //Reduce the amount left to load
                labOrder.amountLeftToLoad -= creep.store.getUsedCapacity(resourceToDeposit);
            }
        } else {
            MovementHelper.myMoveTo(creep, targetLab.pos, stocker);
        }
    }

    private static pickupReagents(stocker: Stocker, myRoom: MyRoom, creep: Creep, labOrder: LabOrder): void {
        if (myRoom.bank == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank.object;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            //Will divide later
            let amountToGrab: number = labOrder.amountLeftToLoad;
            if (amountToGrab * 2 > creep.store.getCapacity()) {
                amountToGrab = creep.store.getCapacity() / 2;
            }

            //Grab reagent 2 if the creep store isn't empty
            const resourceToGrab: MineralsAndCompoundConstant = creep.store.getUsedCapacity() > 0 ? labOrder.reagent2 : labOrder.reagent1;
            const withdrawResult: ScreepsReturnCode = creep.withdraw(bank, resourceToGrab, amountToGrab);
            if (withdrawResult !== OK) {
                ReportController.log("ERROR: Withdraw reagent " + resourceToGrab + " for stocker in room " + LogHelper.roomNameAsLink(myRoom.name) + " resulted in " + withdrawResult);
            }
        } else {
            MovementHelper.myMoveTo(creep, bankPos, stocker);
        }
    }

    private static pickupEnergy(stocker: Stocker, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bank == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank.object;
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
        if (myRoom.bank == null ||
            myRoom.bank.bankPos == null) {
            ReportController.email("ERROR: Room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank.object;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
            for (let i: number = 0; i < resources.length; i++) {
                if (creep.transfer(bank, resources[i]) === OK) {
                    break;
                }
            }
        } else {
            MovementHelper.myMoveTo(creep, bankPos, stocker);
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

    private static resourcesToPickup(room: Room): boolean {
        return room.find(FIND_TOMBSTONES, {
                filter: (t: Tombstone) => {
                    return t.store.getUsedCapacity() > 0;
                }
            }).length > 0 ||
            room.find(FIND_DROPPED_RESOURCES).length > 0;
    }

    private static labOrderToLoadFor(labOrder: LabOrder | null): boolean {
        return labOrder != null &&
            (labOrder.state === "InitialLoading" ||
                labOrder.state === "Loading");
    }

    private static labOrderToUnloadFor(labOrder: LabOrder | null): boolean {
        return labOrder != null &&
            labOrder.state === "Unloading";
    }
}