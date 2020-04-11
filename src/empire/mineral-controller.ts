import {RoomHelper} from "../global/helpers/room-helper";
import {Constants} from "../global/constants";

export class MineralController {
    public static run(myMemory: MyMemory): void {
        const flag: Flag | null = Game.flags["mineral"];
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
                            if (myRoomWithResourceMap.resourceMap[resource] == null) {
                                myRoomWithResourceMap.resourceMap[resource] = creep.store[resource];
                            } else {
                                (myRoomWithResourceMap.resourceMap[resource] as number) += creep.store[resource];
                            }
                        }
                    }
                    return false;
                }
            });
        }

        return result;
    }

}