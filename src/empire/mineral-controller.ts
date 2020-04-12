import {RoomHelper} from "../global/helpers/room-helper";
import {Constants} from "../global/constants";
import {LogHelper} from "../global/helpers/log-helper";
import {ReportController} from "../reporting/report-controller";

export class MineralController {
    public static run(myMemory: MyMemory): void {
        const flag: Flag | null = Game.flags["test-run"];
        if (flag == null) {
            return;
        }
        flag.remove();

        const roomsToUse: MyRoom[] = RoomHelper.getMyRoomsAtOrAboveStageWithXSources(Constants.MINERAL_START_STAGE, 2);
        const resourceMap: GenerateResourceMapResult = this.generateResourceMap(roomsToUse);

        console.log(JSON.stringify(resourceMap));
        this.startOrStopDigging(roomsToUse, resourceMap.totalResourceMap);
    }

    private static startOrStopDigging(roomsToUse: MyRoom[], totalResourceMap: ResourceMap): void {
        const resourceLimits: MineralLimits = {
            K: {
                lower: 100,
                upper: 200
            }
        };
        const minerals: MineralConstant[] = Object.keys(resourceLimits) as MineralConstant[];
        console.log("length: " + minerals.length);
        for (let i: number = 0; i < minerals.length; i++) {
            const mineral: MineralConstant = minerals[i];
            console.log("mineral " + mineral);
            const mineralLimits: ResourceLimitUpperLower = resourceLimits[mineral] as ResourceLimitUpperLower;
            console.log("limits: " + JSON.stringify(mineralLimits));
            if (totalResourceMap[mineral] != null) {
                const amountOfMineral: number = totalResourceMap[mineral] as number;
                console.log("amount: " + amountOfMineral);
                if (amountOfMineral < mineralLimits.lower) {
                    //Start digging
                    this.setDiggingActive(roomsToUse, mineral, true);
                } else if (amountOfMineral > mineralLimits.upper) {
                    //Stop digging
                    this.setDiggingActive(roomsToUse, mineral, false);
                }
            } //else there's none
        }
    }

    private static setDiggingActive(roomsToUse: MyRoom[], mineral: MineralConstant, active: boolean): void {
        console.log("setting active status for mineral " + mineral + " to " + active);
        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoom: MyRoom = roomsToUse[i];
            if (myRoom.digging.mineral === mineral) {
                myRoom.digging.active = active;
                ReportController.log("Set digging active to " + active + " in room " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }
    }

    private static generateResourceMap(roomsToUse: MyRoom[]): GenerateResourceMapResult {
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