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
        //TODO: REMOVE IF WORKS
        if (splitResult.length !== 2) {
            console.log("ERROR: Got this for spltting roomName:");
            console.log(JSON.stringify(splitResult));
            return result;
        }

        const letters: string = roomName.replace(/[0-9]/g, "");
        //TODO: REMOVE IF WORKS
        if (letters.length !== 2) {
            console.log("ERROR: Got this for getting numbers from room name: ");
            console.log(JSON.stringify(letters));
            return result;
        }

        result.xNum = Number(splitResult[0]);
        result.yNum = Number(splitResult[1]);
        result.xChar = letters[0];
        result.yChar = letters[1];

        //TODO: REMOVE IF WORKS
        if ((result.xChar + result.xNum + result.yChar + result.yNum) !== roomName) {
            console.error("ERROR: Doesn't match");
            console.log(JSON.stringify(result));
            console.log(roomName);
        }

        return result;
    }


    private static calcBodyCost(body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant): number {
            return cost + BODYPART_COST[part];
        }, 0);
    }
}