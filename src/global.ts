export const global: any = {
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
            if (global.calcBodyCost(body) + global.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
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
    buildContainerCaches: function (myRoom: MyRoom): void {
        const roomFlags: Flag[] = global.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] === "cont" &&
                flagNameSplit[1] === "cache") {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
                if (result === OK) {
                    console.log("LOG: Placed container cache construction site");
                    roomFlag.remove();
                    for (let j = 0; j < myRoom.mySources.length; j++) {
                        const mySource: MySource = myRoom.mySources[j];
                        const source: Source | null = Game.getObjectById<Source>(mySource.id);
                        if (source == null) {
                            console.log("ERR: Source was null when trying to get it by ID");
                        } else {
                            if (source.pos.inRangeTo(roomFlag.pos, 1)) {
                                mySource.cachePos = {
                                    x: roomFlag.pos.x,
                                    y: roomFlag.pos.y,
                                    roomName: myRoom.name
                                };
                            } // Else it's hopefully the other source in the room...
                        }
                    }

                } else {
                    console.log("ERR: Placing a container cache construction site errored");
                }
            }
        }
    },

    buildExtensions: function (myRoom: MyRoom, numberOfExtensionsToBuild: number): void {
        const roomFlags: Flag[] = global.getRoomsFlags(myRoom);
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
        const roomFlags: Flag[] = global.getRoomsFlags(myRoom);
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
        const bankPos: RoomPosition = global.myPosToRoomPos(myRoom.bankPos);

        const structures: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType === STRUCTURE_STORAGE) {
                return structures[i] as StructureStorage;
                break;
            }
        }
        return null;
    },
    isAllyUsername(username: string): boolean {

        const allyList: string[] = ["mooseyman", "nimphious"];
        if (allyList.indexOf(username.toLowerCase()) !== -1) {
            return true;
        }
        return false;
    }


};
