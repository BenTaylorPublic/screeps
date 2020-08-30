export class RoomHelper {
    public static getMyRoomByName(name: string): MyRoom | null {
        for (let j = 0; j < Memory.myMemory.myRooms.length; j++) {
            if (Memory.myMemory.myRooms[j].name === name) {
                return Memory.myMemory.myRooms[j];
            }
        }
        return null;
    }

    public static getRoomNameAsInterface(roomName: string): MyRoomName {
        const result: MyRoomName = {
            roomName: roomName,
            xNum: -1,
            yNum: -1,
            xChar: "",
            yChar: "",
        };

        const splitResult: string[] = roomName.split(/[NSEW]/g);
        splitResult.splice(0, 1);

        const letters: string = roomName.replace(/[0-9]/g, "");

        result.xNum = Number(splitResult[0]);
        result.yNum = Number(splitResult[1]);
        result.xChar = letters[0];
        result.yChar = letters[1];

        return result;
    }

    public static getRoomNameAsString(myRoomName: MyRoomName): string {
        return myRoomName.xChar + myRoomName.xNum + myRoomName.yChar + myRoomName.yNum;
    }

    public static areaAroundPos(pos: RoomPosition, room: Room): number {
        let result: number = 8;
        const terrain: RoomTerrain = room.getTerrain();

        const roomPositionsAround: { x: number, y: number }[] = [];
        roomPositionsAround.push({x: pos.x, y: pos.y - 1});
        roomPositionsAround.push({x: pos.x, y: pos.y + 1});
        roomPositionsAround.push({x: pos.x - 1, y: pos.y});
        roomPositionsAround.push({x: pos.x + 1, y: pos.y});

        roomPositionsAround.push({x: pos.x - 1, y: pos.y - 1});
        roomPositionsAround.push({x: pos.x - 1, y: pos.y + 1});
        roomPositionsAround.push({x: pos.x + 1, y: pos.y + 1});
        roomPositionsAround.push({x: pos.x + 1, y: pos.y - 1});

        for (let i: number = 0; i < 8; i++) {
            if (terrain.get(roomPositionsAround[i].x, roomPositionsAround[i].y) === TERRAIN_MASK_WALL) {
                result--;
            }
        }
        return result;
    }

    public static amountOfStructure(room: Room, structureConstant: StructureConstant): number {
        const structures: AnyStructure[] = room.find<AnyStructure>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return structures.length;
    }

    public static roomPosToMyPos(roomPos: RoomPosition): MyRoomPos {
        return {
            x: roomPos.x,
            y: roomPos.y,
            roomName: roomPos.roomName
        };
    }

    public static myPosToRoomPos(myPos: MyRoomPos): RoomPosition {
        return new RoomPosition(myPos.x, myPos.y, myPos.roomName);
    }

    public static posMatches(pos: RoomPosition, myPos: MyRoomPos | null): boolean {
        return myPos != null &&
            pos.roomName === myPos.roomName &&
            pos.x === myPos.x &&
            pos.y === myPos.y;
    }

    public static posMatches2(myPos1: MyRoomPos | null | undefined, myPos2: MyRoomPos | null | undefined): boolean {
        return myPos1 != null &&
            myPos2 != null &&
            myPos1.roomName === myPos2.roomName &&
            myPos1.x === myPos2.x &&
            myPos1.y === myPos2.y;
    }

    public static posMatches3(pos1: RoomPosition, pos2: RoomPosition): boolean {
        return pos1 != null &&
            pos2 != null &&
            pos1.roomName === pos2.roomName &&
            pos1.x === pos2.x &&
            pos1.y === pos2.y;
    }

    public static getMyRoomsAtOrAboveStage(stage: Stage): MyRoom[] {
        const result: MyRoom[] = [];
        for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.roomStage >= stage) {
                result.push(myRoom);
            }
        }
        return result;
    }

    public static structureHasResources(structure: AnyStructure): boolean {
        if (structure.structureType === STRUCTURE_EXTENSION) {
            return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        } else if (structure.structureType === STRUCTURE_FACTORY) {
            return structure.store.getUsedCapacity() > 0;
        } else if (structure.structureType === STRUCTURE_LAB) {
            return Object.keys(structure.store).length > 0;
        } else if (structure.structureType === STRUCTURE_LINK) {
            return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        } else if (structure.structureType === STRUCTURE_NUKER) {
            if (structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                return true;
            }
            //Not sure why, but it says it can number or null, but oh well
            const ghodiumOxide: number | null = structure.store.getUsedCapacity(RESOURCE_GHODIUM_OXIDE);
            return (ghodiumOxide != null && ghodiumOxide > 0);
        } else if (structure.structureType === STRUCTURE_POWER_SPAWN) {
            return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ||
                structure.store.getUsedCapacity(RESOURCE_POWER) > 0;
        } else if (structure.structureType === STRUCTURE_SPAWN) {
            return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        } else if (structure.structureType === STRUCTURE_STORAGE) {
            return Object.keys(structure.store).length > 0;
        } else if (structure.structureType === STRUCTURE_TERMINAL) {
            return structure.store.getUsedCapacity() > 0;
        } else if (structure.structureType === STRUCTURE_TOWER) {
            return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        } else if (structure.structureType === STRUCTURE_CONTAINER) {
            return structure.store.getUsedCapacity() > 0;
        } else {
            return false;
        }
    }

    public static getPosOnOtherSide(pos1: RoomPosition, middlePos: RoomPosition): RoomPosition {
        let resultX: number;
        let resultY: number;
        if (pos1.x === middlePos.x) { //Match on X
            resultX = pos1.x;
            if (pos1.y > middlePos.y) {
                resultY = middlePos.y - 1;
            } else {
                resultY = middlePos.y + 1;
            }

        } else {//Match on Y
            resultY = pos1.y;
            if (pos1.x > middlePos.x) {
                resultX = middlePos.x - 1;
            } else {
                resultX = middlePos.x + 1;
            }
        }

        return new RoomPosition(resultX, resultY, pos1.roomName);
    }
}