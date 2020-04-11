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
            myRoomsWithResourceMap: [],
            totalResourceMap: {}
        };

        for (let i: number = 0; i < roomsToUse.length; i++) {
            const myRoomWithResourceMap: MyRoomWithResourceMap = {...roomsToUse[i], resourceMap: {}};
            const room: Room = Game.rooms[myRoomWithResourceMap.name];
            room.find(FIND_MY_CREEPS, {
                filter(creep: Creep): boolean {
                    if (creep.store.getUsedCapacity() > 0) {
                        const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                        for (let j: number = 0; j < resources.length; j++) {
                            const resource: ResourceConstant = resources[j];
                            MineralController.addToResourceMap(myRoomWithResourceMap.resourceMap, resource, creep.store[resource]);
                            MineralController.addToResourceMap(result.totalResourceMap, resource, creep.store[resource]);
                        }
                    }
                    return false;
                }
            });

            result.myRoomsWithResourceMap.push(myRoomWithResourceMap);
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