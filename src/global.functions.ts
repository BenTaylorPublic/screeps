export class GlobalFunctions {
    public static getId(): number {
        const toReturn: number = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    }

    public static calcBodyCost(body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant) {
            return cost + BODYPART_COST[part];
        }, 0);
    }

    public static generateBody(
        baseBody: BodyPartConstant[],
        bodyPartsToAdd: BodyPartConstant[],
        room: Room,
        useBest: boolean
    ): BodyPartConstant[] {

        const maxEnergyToUse: number =
            (useBest) ?
                room.energyCapacityAvailable :
                room.energyAvailable;

        let body: BodyPartConstant[] = baseBody;
        while (true) {
            if (this.calcBodyCost(body) + this.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= 50) {
                body = body.concat(bodyPartsToAdd);
            } else {
                break;
            }
        }
        return body;
    }

    public static amountOfStructure(room: Room, structureConstant: StructureConstant): number {
        const extensions: StructureExtension[] = room.find<StructureExtension>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return extensions.length;
    }

    public static getRoomsFlags(myRoom: MyRoom): Flag[] {
        const result: Flag[] = [];
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.room != null &&
                flag.room.name === myRoom.name) {
                result.push(flag);
            }
        }
        return result;
    }

    public static isConstructable(terrain: RoomTerrain, roomName: string, x: number, y: number): boolean {
        // TODO: Remove terrain as a param
        if (x < 0 || x > 49 || y < 0 || y > 49) {
            return false;
        }
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
            const roomPos: RoomPosition = new RoomPosition(x, y, roomName);
            const structures: Structure<StructureConstant>[] = roomPos.lookFor(LOOK_STRUCTURES);
            if (structures.length !== 0) {
                return false;
            } else {
                return true;
            }
        }

        return false;
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

    public static isAllyUsername(username: string): boolean {
        return ["mooseyman", "nimphious", "james1652"].indexOf(username.toLowerCase()) !== -1;
    }

    public static findClosestSpawn(roomPos: RoomPosition): StructureSpawn | null {
        let spawnToReturn: StructureSpawn | null = null;
        let closestDistance: number = 9999;
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.spawns.length >= 1) {
                const distance: number = Game.map.getRoomLinearDistance(roomPos.roomName, myRoom.name);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    spawnToReturn = Game.spawns[myRoom.spawns[0].name];
                }
            }
        }
        return spawnToReturn;
    }
}
