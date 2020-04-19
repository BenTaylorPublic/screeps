import {RoomHelper} from "./room-helper";

export class MapHelper {
    public static getRoomDistance(roomOneName: string, roomTwoName: string): number {
        const result: FindRouteResult = Game.map.findRoute(roomOneName, roomTwoName, {
            routeCallback(room2: string, room1: string): number {
                if (Memory.myMemory.empire.avoidRooms.includes(room2)) {
                    // avoid this room
                    return Infinity;
                }
                return 1;
            }
        });
        if (result === ERR_NO_PATH) {
            return Infinity;
        }
        return result.length;
    }

    public static isMiddle3x3(roomName: string): boolean {
        const myRoomName: MyRoomName = RoomHelper.getRoomNameAsInterface(roomName);
        const xResult: number = myRoomName.xNum % 10;
        const yResult: number = myRoomName.yNum % 10;
        return (xResult >= 4 && xResult <= 6 &&
            yResult >= 4 && yResult <= 6);
    }

    public static isHighway(roomName: string): boolean {
        const myRoomName: MyRoomName = RoomHelper.getRoomNameAsInterface(roomName);
        const xResult: number = myRoomName.xNum % 10;
        const yResult: number = myRoomName.yNum % 10;
        return (xResult === 0 || yResult === 0);
    }

    public static findClosestSpawnRoomName(roomPos: RoomPosition, minimumStage: number = 1): string | null {
        let result: string | null = null;
        let closestDistance: number = 9999;
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.roomStage >= minimumStage) {
                const distance: number = this.getRoomDistance(roomPos.roomName, myRoom.name);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    result = myRoom.name;
                }
            }
        }
        return result;
    }

    public static findClosestBank(roomName: string, spareCapacity: number): StructureStorage | null {
        let bankToReturn: StructureStorage | null = null;
        let closestDistance: number = 9999;
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.bank != null &&
                (myRoom.bank.object as StructureStorage).store.getFreeCapacity() > spareCapacity) {
                const distance: number = this.getRoomDistance(roomName, myRoom.name);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    bankToReturn = myRoom.bank.object;
                }
            }
        }
        return bankToReturn;
    }
}