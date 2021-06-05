import {RoomHelper} from "../global/helpers/room-helper";
import {Constants} from "../global/constants/constants";
import {LogHelper} from "../global/helpers/log-helper";
import {ReportController} from "../reporting/report-controller";
import {ResourceConstants} from "../global/constants/resource-constants";
import {EmpireHelper} from "../global/helpers/empire-helper";
import {ReportCooldownConstants} from "../global/report-cooldown-constants";

export class MineralController {
    public static run(myMemory: MyMemory): void {
        if (Game.time % 100 !== 0) {
            return;
        }

        const roomsToUse: MyRoom[] = RoomHelper.getMyRoomsAtOrAboveStage(Constants.MINERAL_START_STAGE);

        //Shuffling roomsToUse
        for (let i = roomsToUse.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roomsToUse[i], roomsToUse[j]] = [roomsToUse[j], roomsToUse[i]];
        }

        const resourceMap: GenerateResourceMapResult = this.generateResourceMap(roomsToUse, myMemory.empire.transfers);
        const mineralLimits: ResourceLimits = ResourceConstants.getMineralLimits();
        const forceDigResource: ResourceConstant[] = this.transferMineralsToLowRooms(roomsToUse, resourceMap, myMemory.empire.transfers, mineralLimits);
        this.startOrStopDigging(roomsToUse, resourceMap.totalResourceMap, mineralLimits, forceDigResource);
        this.donateEnergyToDevelopingRooms(roomsToUse, resourceMap, myMemory.empire.transfers);
        this.queueLabOrders(roomsToUse, resourceMap);
    }

    private static queueLabOrders(roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult): void {
        const baseCompoundLimits: ResourceLimitsWithReagents = ResourceConstants.getBaseCompoundLimits();
        const gCompoundLimits: ResourceLimitsWithReagents = ResourceConstants.getGCompoundLimits();
        const tier1CompoundLimits: ResourceLimitsWithReagents = ResourceConstants.getTier1CompoundLimits();
        const tier2CompoundLimits: ResourceLimitsWithReagents = ResourceConstants.getTier2CompoundLimits();
        const tier3CompoundLimits: ResourceLimitsWithReagents = ResourceConstants.getTier3CompoundLimits();

        let newLabOrders: number = 0;
        let labOrdersThatFailedToQueue: number = 0;
        let totalLabOrders: number = 0;
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            if (myRoom.roomStage < 8) {
                /*
                While lower stages can participate in transfers and mining
                Only stage 8 rooms will be doing reactions
                 */
                continue;
            }
            const roomResourceMap: ResourceMap = resourceMap.myRoomMaps[myRoom.name];
            const statsFromBaseQueuing: LabOrderQueueingStats =
                this.tryQueueLabOrderForRoom(myRoom, roomResourceMap, baseCompoundLimits, 0);
            const statsFromGQueuing: LabOrderQueueingStats =
                this.tryQueueLabOrderForRoom(myRoom, roomResourceMap, gCompoundLimits, 0.5);
            const statsTier1Queuing: LabOrderQueueingStats =
                this.tryQueueLabOrderForRoom(myRoom, roomResourceMap, tier1CompoundLimits, 1);
            const statsTier2Queuing: LabOrderQueueingStats =
                this.tryQueueLabOrderForRoom(myRoom, roomResourceMap, tier2CompoundLimits, 2);
            const statsTier3Queuing: LabOrderQueueingStats =
                this.tryQueueLabOrderForRoom(myRoom, roomResourceMap, tier3CompoundLimits, 3);

            //Stats
            newLabOrders += statsFromBaseQueuing.newLabOrders +
                statsFromGQueuing.newLabOrders +
                statsTier1Queuing.newLabOrders +
                statsTier2Queuing.newLabOrders +
                statsTier3Queuing.newLabOrders;
            labOrdersThatFailedToQueue += statsFromBaseQueuing.labOrdersThatFailedToQueue +
                statsFromGQueuing.labOrdersThatFailedToQueue +
                statsTier1Queuing.labOrdersThatFailedToQueue +
                statsTier2Queuing.labOrdersThatFailedToQueue +
                statsTier3Queuing.labOrdersThatFailedToQueue;
            totalLabOrders += (myRoom.labs as LabMemory).labOrders.length;
        }

        if (totalLabOrders === 0 &&
            labOrdersThatFailedToQueue === 0 &&
            newLabOrders === 0) {
            ReportController.email("Rooms are content with current compounds", ReportCooldownConstants.DAY);
        } else {
            ReportController.log("New lab orders: " + newLabOrders);
            ReportController.log("Lab orders that failed to queue: " + labOrdersThatFailedToQueue);
            ReportController.log("Total lab orders: " + totalLabOrders);
        }
    }

    private static tryQueueLabOrderForRoom(myRoom: MyRoom, roomResourceMap: ResourceMap, tieredResourceLimits: ResourceLimitsWithReagents, priority: number): LabOrderQueueingStats {

        const statsResults: LabOrderQueueingStats = {
            newLabOrders: 0,
            labOrdersThatFailedToQueue: 0
        };
        const cantCreateList: string[] = [];
        const needMoreOfList: string[] = [];

        const resources: MineralsAndCompoundConstant[] = Object.keys(tieredResourceLimits) as MineralsAndCompoundConstant[];
        for (const resource of resources) {
            const resourceLimits: ResourceLimitUpperLowerWithReagents = tieredResourceLimits[resource] as ResourceLimitUpperLowerWithReagents;
            const amountOfResource: number = this.getAmountOfResource(roomResourceMap, resource);

            if (amountOfResource < resourceLimits.lower) {
                //The room needs more of this resource
                //There could be another already existing order for this resource
                let alreadyExistingOrderForThisResource: boolean = false;
                for (let j: number = 0; j < (myRoom.labs as LabMemory).labOrders.length; j++) {
                    const currentLabOrder: LabOrder = (myRoom.labs as LabMemory).labOrders[j];
                    if (currentLabOrder.compound === resource) {
                        alreadyExistingOrderForThisResource = true;
                        break;
                    }
                }
                if (alreadyExistingOrderForThisResource) {
                    continue;
                }

                let amountNeeded: number = Math.ceil((resourceLimits.upper - amountOfResource) / Constants.LAB_REACTION_AMOUNT_TO_CEIL_TO) * Constants.LAB_REACTION_AMOUNT_TO_CEIL_TO;
                let amounts: number[] = [];
                //3k is the limit of the reagent labs
                if (amountNeeded > 3_000) {
                    const lots: number = Math.floor(amountNeeded / 3_000);
                    for (let j: number = 0; j < lots; j++) {
                        amounts.push(3_000);
                    }
                    const leftOver: number = amountNeeded - (lots * 3_000);
                    amounts.push(leftOver);
                } else {
                    amounts.push(amountNeeded);
                }

                if (myRoom.bank == null ||
                    myRoom.bank.object == null) {
                    ReportController.email("BAD: Can't create resource " + resource + " in room " + LogHelper.roomNameAsLink(myRoom.name) + " bank being null",
                        ReportCooldownConstants.FIVE_MINUTE);
                    statsResults.labOrdersThatFailedToQueue += 1;
                    continue;
                }

                //There might not be enough of the reagents to make this resource
                const amountOfReagent1: number = this.getAmountOfResource(roomResourceMap, resourceLimits.reagent1);
                if (amountOfReagent1 < amountNeeded ||
                    myRoom.bank.object.store.getUsedCapacity(resourceLimits.reagent1) < amountNeeded) {
                    if (amounts.length > 1 &&
                        amountOfReagent1 >= 3_000 &&
                        myRoom.bank.object.store.getUsedCapacity(resourceLimits.reagent1) >= 3_000) {
                        amounts = [3_000];
                        amountNeeded = 3_000;
                    } else {
                        cantCreateList.push(resource);
                        needMoreOfList.push(resourceLimits.reagent1);
                        statsResults.labOrdersThatFailedToQueue += 1;
                        continue;
                    }
                }
                const amountOfReagent2: number = this.getAmountOfResource(roomResourceMap, resourceLimits.reagent2);
                if (amountOfReagent2 < amountNeeded ||
                    myRoom.bank.object.store.getUsedCapacity(resourceLimits.reagent2) < amountNeeded) {
                    if (amounts.length > 1 &&
                        amountOfReagent2 >= 3_000 &&
                        myRoom.bank.object.store.getUsedCapacity(resourceLimits.reagent2) >= 3_000) {
                        amounts = [3_000];
                        amountNeeded = 3_000;
                    } else {
                        cantCreateList.push(resource);
                        needMoreOfList.push(resourceLimits.reagent2);
                        statsResults.labOrdersThatFailedToQueue += 1;
                        continue;
                    }
                }

                for (let j: number = 0; j < amounts.length; j++) {
                    this.queueLabOrder(myRoom, resource, amounts[j], resourceLimits, priority);
                }

                //It can't be null, but ohwell
                if (roomResourceMap[resourceLimits.reagent1] != null) {
                    (roomResourceMap[resourceLimits.reagent1] as number) -= amountNeeded;
                }
                if (roomResourceMap[resourceLimits.reagent2] != null) {
                    (roomResourceMap[resourceLimits.reagent2] as number) -= amountNeeded;
                }

                ReportController.log("Queued a new reaction for room " + LogHelper.roomNameAsLink(myRoom.name) + " to create " + resource);
                statsResults.newLabOrders += amounts.length;
            }
        }

        if (cantCreateList.length > 0 && needMoreOfList.length > 0) {
            const messages: string[] = [];
            for (let i: number = 0; 0 < cantCreateList.length; i++) {
                messages.push(`${cantCreateList[i]} (${needMoreOfList[i]})`);
            }
            ReportController.log(`${LogHelper.roomNameAsLink(myRoom.name)} can't create ${LogHelper.commaSeperateList(messages)}`);
        }
        return statsResults;
    }

    private static queueLabOrder(myRoom: MyRoom, resource: MineralsAndCompoundConstant, amountNeeded: number, resourceLimits: ResourceLimitUpperLowerWithReagents, priority: number): void {

        //We can queue the order!
        const newLabOrder: LabOrder = {
            amount: amountNeeded,
            amountLeftToLoad: amountNeeded,
            compound: resource,
            reagent1: resourceLimits.reagent1,
            reagent2: resourceLimits.reagent2,
            state: "Queued",
            priority: priority,
            cooldown: resourceLimits.cooldown,
            cooldownTill: 0
        };

        //Inserting the lab order into the sorted array
        if ((myRoom.labs as LabMemory).labOrders.length === 0) {
            (myRoom.labs as LabMemory).labOrders.push(newLabOrder);
        } else {
            let inserted: boolean = false;
            for (let j: number = 0; j < (myRoom.labs as LabMemory).labOrders.length; j++) {
                //Priority is backwards
                //0 is tier0, which is more important than tier 3
                if (newLabOrder.priority < (myRoom.labs as LabMemory).labOrders[j].priority) {
                    (myRoom.labs as LabMemory).labOrders.splice(j, 0, newLabOrder);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                //Still hasn't inserted yet
                //Put on the end
                (myRoom.labs as LabMemory).labOrders = (myRoom.labs as LabMemory).labOrders.concat(newLabOrder);
            }
        }
    }

    private static donateEnergyToDevelopingRooms(roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult, transfers: Transfer[]): void {
        const alreadyDonatedToThisTick: string[] = [];
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const donorRoom: MyRoom = roomsToUse[i];
            if (donorRoom.roomStage !== 8) {
                continue;
            }
            const donorRoomResourceMap: ResourceMap = resourceMap.myRoomMaps[donorRoom.name];
            if (donorRoomResourceMap.energy != null &&
                donorRoomResourceMap.energy >= Constants.STAGE_8_DONATE_AT) {
                //Want to donate
                let lowestEnergyAmount: number = Constants.DONT_DONATE_TO_ROOMS_WITH_ABOVE_ENERGY;
                let lowestEnergyIndex: number = -1;
                for (let j: number = 0; j < roomsToUse.length; j++) {
                    const doneeRoom: MyRoom = roomsToUse[j];
                    if (doneeRoom.roomStage < 6 ||
                        (doneeRoom.roomStage > 7 &&
                            //Dont donate to 2 source RCL8s
                            //They can get their own damn energy
                            doneeRoom.mySources.length >= 2)
                    ) {
                        continue;
                    }

                    if (alreadyDonatedToThisTick.includes(doneeRoom.name)) {
                        continue;
                    }

                    const doneeRoomResourceMap: ResourceMap = resourceMap.myRoomMaps[doneeRoom.name];
                    if (doneeRoomResourceMap.energy != null &&
                        doneeRoomResourceMap.energy < lowestEnergyAmount &&
                        doneeRoomResourceMap.energy < Constants.DONT_DONATE_TO_ROOMS_WITH_ABOVE_ENERGY) {
                        if (doneeRoom.mySources.length < 2 &&
                            doneeRoom.roomStage === 8 &&
                            doneeRoomResourceMap.energy >= Constants.STAGE_8_ONE_SOURCE_ENERGY_DONATE_TARGET) {
                            //Stage 8, 1 source room, that has enough energy to function
                            //Skip
                            continue;
                        }

                        lowestEnergyAmount = doneeRoomResourceMap.energy;
                        lowestEnergyIndex = j;
                    }
                }

                if (lowestEnergyIndex === -1) {
                    // No rooms need energy
                    ReportController.log("No room wants energy");
                    return;
                }

                //Otherwise, we're good to donate
                this.createTransfer(donorRoom.name, roomsToUse[lowestEnergyIndex].name, "energy", Constants.STAGE_8_DONATE_AMOUNT, donorRoomResourceMap, transfers);
                alreadyDonatedToThisTick.push(roomsToUse[lowestEnergyIndex].name);
            }
        }
    }

    private static transferMineralsToLowRooms(roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult, transfers: Transfer[], mineralLimits: ResourceLimits): ResourceConstant[] {
        const forceDigResources: ResourceConstant[] = [];
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            const roomResourceMap: ResourceMap = resourceMap.myRoomMaps[myRoom.name];
            const resources: ResourceConstant[] = Object.keys(mineralLimits) as ResourceConstant[];
            for (let j: number = 0; j < resources.length; j++) {
                const resource: ResourceConstant = resources[j];
                const resourceLimits: ResourceLimitUpperLower = mineralLimits[resource] as ResourceLimitUpperLower;
                const amountOfMineral: number = this.getAmountOfResource(roomResourceMap, resource);
                if (amountOfMineral < resourceLimits.lower) {

                    if (resource === myRoom.digging.mineral &&
                        !myRoom.digging.active) {
                        //Don't request transfers for a mineral that's already in the room
                        //That'd be lazy
                        myRoom.digging.active = true;
                        ReportController.log("Room " + LogHelper.roomNameAsLink(myRoom.name) + " is low on its own mineral (" + myRoom.digging.mineral + "), setting digging to true");
                    } else {
                        //Request transfer
                        const amountNeeded: number = Math.ceil((resourceLimits.upper - amountOfMineral) / Constants.BANK_LINKER_CAPACITY) * Constants.BANK_LINKER_CAPACITY;
                        if (!this.requestTransfer(myRoom, resource, amountNeeded, roomsToUse, resourceMap, transfers, resourceLimits.lower)) {
                            //Failed to find a room to transfer from
                            //Add it to the list, which will force these diggings to active
                            if (!forceDigResources.includes(resource)) {
                                forceDigResources.push(resource);
                            }
                        }
                    }
                }
            }
        }
        return forceDigResources;
    }

    private static requestTransfer(receivingRoom: MyRoom, resource: ResourceConstant, amountNeeded: number, roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult, transfers: Transfer[], resourceLimitLower: number): boolean {
        let highestFoundAmount: number = -1;
        let highestFoundIndex: number = -1;
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const potentialRoomToTransferFrom: MyRoom = roomsToUse[i];
            if (potentialRoomToTransferFrom.digging == null ||
                potentialRoomToTransferFrom.digging.mineral !== resource) {
                //Don't get a mineral, off a room that doesn't have it as a source
                continue;
            }

            const potentialRoomToTransferFromResourceMap: ResourceMap = resourceMap.myRoomMaps[potentialRoomToTransferFrom.name];
            if (potentialRoomToTransferFrom.name === receivingRoom.name ||
                potentialRoomToTransferFromResourceMap[resource] == null ||
                (potentialRoomToTransferFromResourceMap[resource] as number) <= highestFoundAmount ||
                (potentialRoomToTransferFromResourceMap[resource] as number) <= amountNeeded ||
                (potentialRoomToTransferFromResourceMap[resource] as number) <= amountNeeded + resourceLimitLower) {
                continue;
            }

            highestFoundAmount = potentialRoomToTransferFromResourceMap[resource] as number;
            highestFoundIndex = i;
        }

        if (highestFoundIndex === -1) {
            return false;
        }
        //We have a room
        this.createTransfer(roomsToUse[highestFoundIndex].name, receivingRoom.name, resource, amountNeeded, resourceMap.myRoomMaps[roomsToUse[highestFoundIndex].name] as ResourceMap, transfers);
        return true;
    }

    private static createTransfer(sendingRoomName: string, receivingRoomName: string, resource: ResourceConstant, amount: number, sendingRoomResourceMap: ResourceMap, transfers: Transfer[]): void {
        const transfer: Transfer = {
            amount: amount,
            amountLeft: amount,
            resource: resource,
            roomFrom: sendingRoomName,
            roomTo: receivingRoomName,
            state: "Loading",
            id: EmpireHelper.getNewTransferId()
        };
        transfers.push(transfer);
        (sendingRoomResourceMap[resource] as number) -= amount;

        ReportController.log("Loading " + transfer.amount + " " + transfer.resource + " from " + LogHelper.roomNameAsLink(transfer.roomFrom) + " to " + LogHelper.roomNameAsLink(transfer.roomTo));
        //Not going to add it to the other room
        //Because otherwise in this same tick another room could take it from it
        //But it wont affect the totalMap, which would affect digging
    }

    private static startOrStopDigging(roomsToUse: MyRoom[], totalResourceMap: ResourceMap, mineralLimits: ResourceLimits, forceDigResource: ResourceConstant[]): void {
        //This isn't the only place where digging is set to true
        //It's also set if a transfer is needed

        const resources: ResourceConstant[] = Object.keys(mineralLimits) as ResourceConstant[];
        for (let i: number = 0; i < resources.length; i++) {
            const mineral: MineralConstant = resources[i] as MineralConstant;
            if (forceDigResource.includes(mineral)) {
                this.setDiggingActive(roomsToUse, mineral, true);
                continue;
            }
            //Otherwise, dig until the empire has more than UpperLimit*Rooms
            const mineralLimit: ResourceLimitUpperLower = mineralLimits[mineral] as ResourceLimitUpperLower;
            const mineralLimitUpper: number = mineralLimit.upper * roomsToUse.length;
            const amountOfMineral: number = this.getAmountOfResource(totalResourceMap, mineral);
            if (amountOfMineral > mineralLimitUpper) {
                //Stop digging
                this.setDiggingActive(roomsToUse, mineral, false);
            } else {
                //Start digging
                this.setDiggingActive(roomsToUse, mineral, true);
            }
        }
    }

    private static setDiggingActive(roomsToUse: MyRoom[], mineral: MineralConstant, active: boolean): void {
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            if (myRoom.digging.mineral === mineral &&
                myRoom.digging.active !== active) {
                myRoom.digging.active = active;
                ReportController.log("Set digging active to " + active + " in room " + LogHelper.roomNameAsLink(myRoom.name) + " for mineral " + mineral);
            }
        }
    }

    private static generateResourceMap(roomsToUse: MyRoom[], transfers: Transfer[]): GenerateResourceMapResult {
        const result: GenerateResourceMapResult = {
            myRoomMaps: {},
            totalResourceMap: {}
        };

        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            const roomResourceMap: ResourceMap = {};
            const room: Room = Game.rooms[myRoom.name];
            room.find(FIND_MY_CREEPS, {
                filter(creep: Creep): boolean {
                    if (creep.store.getUsedCapacity() > 0) {
                        const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                        for (let j: number = 0; j < resources.length; j++) {
                            const resource: ResourceConstant = resources[j];
                            MineralController.addToResourceMap(roomResourceMap, resource, creep.store[resource]);
                            MineralController.addToResourceMap(result.totalResourceMap, resource, creep.store[resource]);
                        }
                    }
                    return false;
                }
            });
            room.find(FIND_MY_STRUCTURES, {
                filter(structure: AnyStructure): boolean {
                    if (structure.structureType !== STRUCTURE_EXTENSION &&
                        structure.structureType !== STRUCTURE_SPAWN &&
                        structure.structureType !== STRUCTURE_NUKER &&
                        structure.structureType !== STRUCTURE_FACTORY &&
                        structure.structureType !== STRUCTURE_TOWER &&
                        structure.structureType !== STRUCTURE_TERMINAL &&
                        RoomHelper.structureHasResources(structure)) {
                        const resources: ResourceConstant[] = Object.keys((structure as AnyStoreStructure).store) as ResourceConstant[];
                        for (let j: number = 0; j < resources.length; j++) {
                            const resource: ResourceConstant = resources[j];
                            MineralController.addToResourceMap(roomResourceMap, resource, (structure as AnyStoreStructure).store[resource]);
                            MineralController.addToResourceMap(result.totalResourceMap, resource, (structure as AnyStoreStructure).store[resource]);
                        }
                    }
                    return false;
                }
            });

            //Transfers affect this room only, not the total map
            for (let j: number = 0; j < transfers.length; j++) {
                const transfer: Transfer = transfers[j];
                if (transfer.roomFrom === myRoom.name &&
                    transfer.state === "Loading") {
                    MineralController.addToResourceMap(roomResourceMap, transfer.resource, -transfer.amountLeft);
                } else if (transfer.roomTo === myRoom.name) {
                    if (transfer.state === "Loading") {
                        MineralController.addToResourceMap(roomResourceMap, transfer.resource, transfer.amount);
                    } else if (transfer.state === "Unloading" || transfer.state === "Sending") {
                        MineralController.addToResourceMap(roomResourceMap, transfer.resource, transfer.amountLeft);
                    }
                }
            }

            result.myRoomMaps[myRoom.name] = roomResourceMap;
        }

        return result;
    }

    private static addToResourceMap(resourceMap: ResourceMap, resource: ResourceConstant, amount: number): void {
        if (resourceMap[resource] == null) {
            resourceMap[resource] = amount;
        } else {
            (resourceMap[resource] as number) += amount;
        }
    }

    private static getAmountOfResource(resourceMap: ResourceMap, resource: ResourceConstant): number {
        if (resourceMap[resource] == null) {
            return 0;
        } else {
            return resourceMap[resource] as number;
        }
    }
}

interface LabOrderQueueingStats {
    newLabOrders: number;
    labOrdersThatFailedToQueue: number;
}