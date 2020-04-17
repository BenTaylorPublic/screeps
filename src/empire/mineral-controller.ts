import {RoomHelper} from "../global/helpers/room-helper";
import {Constants} from "../global/constants/constants";
import {LogHelper} from "../global/helpers/log-helper";
import {ReportController} from "../reporting/report-controller";
import {ResourceConstants} from "../global/constants/resource-constants";

export class MineralController {
    public static run(myMemory: MyMemory): void {
        if (Game.time % 100 !== 0) {
            return;
        }

        const roomsToUse: MyRoom[] = RoomHelper.getMyRoomsAtOrAboveStageWithXSources(Constants.MINERAL_START_STAGE, 2);
        const resourceMap: GenerateResourceMapResult = this.generateResourceMap(roomsToUse, myMemory.empire.transfers);
        const mineralLimits: ResourceLimits = ResourceConstants.getMineralLimits();
        this.startOrStopDigging(roomsToUse, resourceMap.totalResourceMap, mineralLimits);
        this.transferMineralsToLowRooms(roomsToUse, resourceMap, myMemory.empire.transfers, mineralLimits);
        this.donateEnergyToDevelopingRooms(roomsToUse, resourceMap, myMemory.empire.transfers);
    }

    private static donateEnergyToDevelopingRooms(roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult, transfers: Transfer[]): void {
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const donorRoom: MyRoom = roomsToUse[i];
            if (donorRoom.roomStage !== 8) {
                continue;
            }
            const donorRoomResourceMap: ResourceMap = resourceMap.myRoomMaps[donorRoom.name];
            if (donorRoomResourceMap.energy != null &&
                donorRoomResourceMap.energy >= Constants.STAGE_8_DONATE_AT) {
                //Want to donate
                let lowestEnergyAmount: number = 1_000_000;
                let lowestEnergyIndex: number = -1;
                for (let j: number = 0; j < roomsToUse.length; j++) {
                    const doneeRoom: MyRoom = roomsToUse[j];
                    if (doneeRoom.roomStage < 6 ||
                        doneeRoom.roomStage > 7) {
                        continue;
                    }
                    const doneeRoomResourceMap: ResourceMap = resourceMap.myRoomMaps[doneeRoom.name];
                    if (doneeRoomResourceMap.energy != null &&
                        doneeRoomResourceMap.energy < lowestEnergyAmount) {
                        lowestEnergyAmount = doneeRoomResourceMap.energy;
                        lowestEnergyIndex = j;
                    }
                }

                if (lowestEnergyIndex === -1) {
                    // No rooms need energy
                    // Just return
                    return;
                }

                //Otherwise, we're good to donate
                this.createTransfer(donorRoom.name, roomsToUse[lowestEnergyIndex].name, "energy", Constants.STAGE_8_DONATE_AMOUNT, donorRoomResourceMap, transfers);
            }
        }
    }

    private static transferMineralsToLowRooms(roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult, transfers: Transfer[], mineralLimits: ResourceLimits): void {
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            const roomResourceMap: ResourceMap = resourceMap.myRoomMaps[myRoom.name];
            const resources: ResourceConstant[] = Object.keys(mineralLimits) as ResourceConstant[];
            for (let j: number = 0; j < resources.length; j++) {
                const resource: ResourceConstant = resources[j];
                const resourceLimits: ResourceLimitUpperLower = mineralLimits[resource] as ResourceLimitUpperLower;
                let amountOfMineral: number;
                if (roomResourceMap[resource] == null) {
                    amountOfMineral = 0;
                } else {
                    amountOfMineral = roomResourceMap[resource] as number;
                }
                if (amountOfMineral < resourceLimits.lower) {
                    //Request transfer
                    const amountNeeded: number = Math.ceil((resourceLimits.upper - amountOfMineral) / Constants.BANK_LINKER_CAPACITY) * Constants.BANK_LINKER_CAPACITY;
                    this.requestTransfer(myRoom, resource, amountNeeded, roomsToUse, resourceMap, transfers, resourceLimits.lower);
                }
            }
        }
    }

    private static requestTransfer(receivingRoom: MyRoom, resource: ResourceConstant, amountNeeded: number, roomsToUse: MyRoom[], resourceMap: GenerateResourceMapResult, transfers: Transfer[], resourceLimitLower: number): void {
        let highestFoundAmount: number = -1;
        let highestFoundIndex: number = -1;
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const potentialRoomToTransferFrom: MyRoom = roomsToUse[i];
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
            return;
        }
        //We have a room
        this.createTransfer(roomsToUse[highestFoundIndex].name, receivingRoom.name, resource, amountNeeded, resourceMap.myRoomMaps[roomsToUse[highestFoundIndex].name] as ResourceMap, transfers);
    }

    private static createTransfer(sendingRoomName: string, receivingRoomName: string, resource: ResourceConstant, amount: number, sendingRoomResourceMap: ResourceMap, transfers: Transfer[]): void {
        const transfer: Transfer = {
            amount: amount,
            amountLeft: amount,
            resource: resource,
            roomFrom: sendingRoomName,
            roomTo: receivingRoomName,
            state: "Loading",
            actionStarted: false
        };
        transfers.push(transfer);
        (sendingRoomResourceMap[resource] as number) -= amount;

        ReportController.log("Loading " + transfer.amount + " " + transfer.resource + " from " + LogHelper.roomNameAsLink(transfer.roomFrom) + " to " + LogHelper.roomNameAsLink(transfer.roomTo));
        //Not going to add it to the other room
        //Because otherwise in this same tick another room could take it from it
        //But it wont affect the totalMap, which would affect digging
    }

    private static startOrStopDigging(roomsToUse: MyRoom[], totalResourceMap: ResourceMap, mineralLimits: ResourceLimits): void {

        const resources: ResourceConstant[] = Object.keys(mineralLimits) as ResourceConstant[];
        for (let i: number = 0; i < resources.length; i++) {
            const mineral: MineralConstant = resources[i] as MineralConstant;
            const mineralLimit: ResourceLimitUpperLower = mineralLimits[mineral] as ResourceLimitUpperLower;
            const mineralLimitLower: number = mineralLimit.lower * roomsToUse.length;
            const mineralLimitUpper: number = mineralLimit.upper * roomsToUse.length;
            let amountOfMineral: number;
            if (totalResourceMap[mineral] == null) {
                amountOfMineral = 0;
            } else {
                amountOfMineral = totalResourceMap[mineral] as number;
            }
            if (amountOfMineral < mineralLimitLower) {
                //Start digging
                this.setDiggingActive(roomsToUse, mineral, true);
            } else if (amountOfMineral > mineralLimitUpper) {
                //Stop digging
                this.setDiggingActive(roomsToUse, mineral, false);
            }
        }
    }

    private static setDiggingActive(roomsToUse: MyRoom[], mineral: MineralConstant, active: boolean): void {
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            if (myRoom.digging.mineral === mineral &&
                myRoom.digging.active !== active) {
                myRoom.digging.active = active;
                ReportController.email("Set digging active to " + active + " in room " + LogHelper.roomNameAsLink(myRoom.name));
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

    public static addToResourceMap(resourceMap: ResourceMap, resource: ResourceConstant, amount: number): void {
        if (resourceMap[resource] == null) {
            resourceMap[resource] = amount;
        } else {
            (resourceMap[resource] as number) += amount;
        }
    }
}