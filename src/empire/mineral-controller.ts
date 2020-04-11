import {RoomHelper} from "../global/helpers/room-helper";
import {Constants} from "../global/constants";

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
                    if (RoomHelper.structureHasResources(structure)) {
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