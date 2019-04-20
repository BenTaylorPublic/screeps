export const globalFunctions: any = {
    getId: function (): number {
        const toReturn: number = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    },
    calcBodyCost: function (body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant) {
            return cost + BODYPART_COST[part];
        }, 0);
    },
    generateBody: function (
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
            if (globalFunctions.calcBodyCost(body) + globalFunctions.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= 50) {
                body = body.concat(bodyPartsToAdd);
            } else {
                break;
            }
        }
        return body;
    },
    amountOfStructure: function (room: Room, structureConstant: StructureConstant): number {
        const extensions: StructureExtension[] = room.find<StructureExtension>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return extensions.length;
    },
    getRoomsFlags: function (myRoom: MyRoom): Flag[] {
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
    },
    buildExtensions: function (myRoom: MyRoom, numberOfExtensionsToBuild: number): void {
        const roomFlags: Flag[] = globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] === "ex") {
                const extensionNumber: number = Number(flagNameSplit[1]);
                if (extensionNumber <= numberOfExtensionsToBuild) {
                    const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_EXTENSION);
                    if (result === OK) {
                        console.log("LOG: Placed extension construction site");
                        myRoom.myExtensionPositions.push({
                            x: roomFlag.pos.x,
                            y: roomFlag.pos.y,
                            roomName: myRoom.name
                        });
                        roomFlag.remove();
                    } else {
                        console.log("ERR: Placing a extension construction site errored");
                    }
                }
            }
        }
    },
    buildTowers: function (myRoom: MyRoom, numberOfTowersToBuild: number): void {
        const roomFlags: Flag[] = globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] === "tower") {
                const towerNumber: number = Number(flagNameSplit[1]);
                if (towerNumber <= numberOfTowersToBuild) {
                    const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_TOWER);
                    if (result === OK) {
                        console.log("LOG: Placed tower construction site");
                        myRoom.myTowerPositions.push({
                            x: roomFlag.pos.x,
                            y: roomFlag.pos.y,
                            roomName: myRoom.name
                        });
                        roomFlag.remove();
                    } else {
                        console.log("ERR: Placing a tower construction site errored");
                    }
                }
            }
        }
    },
    isConstructable: function (terrain: RoomTerrain, roomName: string, x: number, y: number): boolean {
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
    },
    roomPosToMyPos: function (roomPos: RoomPosition): MyRoomPos {
        return {
            x: roomPos.x,
            y: roomPos.y,
            roomName: roomPos.roomName
        };
    },
    myPosToRoomPos: function (myPos: MyRoomPos): MyRoomPos {
        return new RoomPosition(myPos.x, myPos.y, myPos.roomName);
    },
    getBank: function (myRoom: MyRoom): StructureStorage | null {
        if (myRoom.bankPos == null) {
            return null;
        }
        const bankPos: RoomPosition = globalFunctions.myPosToRoomPos(myRoom.bankPos);

        const structures: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType === STRUCTURE_STORAGE) {
                return structures[i] as StructureStorage;
                break;
            }
        }
        return null;
    },
    isAllyUsername: function (username: string): boolean {
        return ["mooseyman", "nimphious"].indexOf(username.toLowerCase()) !== -1;
    },
    findClosestSpawn: function (roomPos: RoomPosition): StructureSpawn | null {
        let spawnToReturn: StructureSpawn | null = null;
        let closestDistance: number = 9999;
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            for (let j = 0; j < myRoom.spawns.length; j++) {
                const mySpawn: MySpawn = myRoom.spawns[j];
                const mySpawnRoomPos: RoomPosition = globalFunctions.myPosToRoomPos(mySpawn.position);
                const distance: number = mySpawnRoomPos.getRangeTo(roomPos);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    spawnToReturn = Game.spawns[mySpawn.name];
                }
            }
        }
        return spawnToReturn;
    }
};
