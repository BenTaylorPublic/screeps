export class HelperFunctions {
    public static getId(): number {
        const toReturn: number = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    }

    public static generateBody(
        baseBody: BodyPartConstant[],
        bodyPartsToAdd: BodyPartConstant[],
        room: Room,
        useBest: boolean,
        maxBodySize: number = 50,
        fillWithTough: boolean = false
    ): BodyPartConstant[] {


        const maxEnergyToUse: number =
            (useBest) ?
                room.energyCapacityAvailable :
                room.energyAvailable;


        let body: BodyPartConstant[] = baseBody;
        while (true) {
            if (this.calcBodyCost(body) + this.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= maxBodySize) {
                body = body.concat(bodyPartsToAdd);
            } else {
                break;
            }
        }

        if (fillWithTough) {
            const toughtPart: BodyPartConstant[] = [TOUGH];
            while (true) {
                if (this.calcBodyCost(body) + this.calcBodyCost(toughtPart) <= maxEnergyToUse &&
                    body.length + 1 <= maxBodySize) {
                    body = toughtPart.concat(body);
                } else {
                    break;
                }
            }
        }

        return body;
    }

    public static amountOfStructure(room: Room, structureConstant: StructureConstant): number {
        const structures: StructureExtension[] = room.find<StructureExtension>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return structures.length;
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
        return ["james1652"].indexOf(username.toLowerCase()) !== -1;
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

    public static getMyRoomByName(name: string): MyRoom | null {
        for (let j = 0; j < Memory.myMemory.myRooms.length; j++) {
            if (Memory.myMemory.myRooms[j].name === name) {
                return Memory.myMemory.myRooms[j];
            }
        }
        return null;
    }

    public static logTable(table: string[][]): void {
        //If the table is missing things then it'll just break
        const maxColumnWidth: number[] = [];
        for (let columnIndex: number = 0; columnIndex < table[0].length; columnIndex++) {
            maxColumnWidth[columnIndex] = 0;
            for (let rowIndex: number = 0; rowIndex < table.length; rowIndex++) {
                const length: number = table[rowIndex][columnIndex].length;
                if (length > maxColumnWidth[columnIndex]) {
                    maxColumnWidth[columnIndex] = length + 1;
                }
            }
        }

        for (let rowIndex: number = 0; rowIndex < table.length; rowIndex++) {
            let rowAsString: string = "";
            for (let columnIndex: number = 0; columnIndex < table[rowIndex].length; columnIndex++) {
                const dataInCell: string = table[rowIndex][columnIndex];
                rowAsString += dataInCell;
                const spacesToAdd: number = maxColumnWidth[columnIndex] - dataInCell.length;
                for (let spacesToFill = 0; spacesToFill < spacesToAdd; spacesToFill++) {
                    rowAsString += " ";
                }
            }
            console.log(rowAsString);
        }
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

    public static getCreepToRoom(creep: Creep, creepMemory: MyCreep, roomName: string): void {
        if (creepMemory.interRoomTravelCurrentTarget == null ||
            creep.pos.roomName !== creepMemory.interRoomTravelCurrentTarget.roomName) {
            //Needs a new target
            const target: RoomPosition | null = this.getInterRoomTravelPathTarget(creep.pos.roomName, roomName);
            if (target == null) {
                return;
            }
            creepMemory.interRoomTravelCurrentTarget = this.roomPosToMyPos(target);
        }

        console.log(creep.moveTo(this.myPosToRoomPos(creepMemory.interRoomTravelCurrentTarget)));
    }

    private static getInterRoomTravelPathTarget(fromRoomName: string, toRoomName: string): RoomPosition | null {
        const result1: FindRouteResult = Game.map.findRoute(fromRoomName, toRoomName, {
            routeCallback(room2: string, room1: string): number {
                if (Memory.myMemory.empire.avoidRooms.includes(room2)) {
                    // avoid this room
                    return Infinity;
                }
                return 1;
            }
        });
        if (result1 === ERR_NO_PATH) {
            console.log("ERROR: getInterRoomTravelPath got ERRO_NO_PATH for " + fromRoomName + " to " + toRoomName);
            return null;
        }
        if (result1.length <= 0) {
            console.log("ERROR: getInterRoomTravelPath length <= 0");
            return null;
        }

        const thisRoomsExits: RoomPosition[] = Game.rooms[fromRoomName].find(result1[0].exit);

        return thisRoomsExits[0];
    }

    private static calcBodyCost(body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant): number {
            return cost + BODYPART_COST[part];
        }, 0);
    }
}