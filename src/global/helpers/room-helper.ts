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
        const structures: StructureExtension[] = room.find<StructureExtension>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return structures.length;
    }
}