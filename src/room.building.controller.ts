export const roomBuildingController: any = {
    run: function (myRoom: MyRoom) {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("ERR: No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room

        //TODO: Ensure all extensions and towers still exist

        if (myRoom.roomStage === 0.5) {
            roomNeedsFirstSpawn(myRoom);
        } else if (myRoom.roomStage === 1.5) {
            buildExtensions(myRoom, 5);
        } else if (myRoom.roomStage === 2.2) {
            buildTowers(myRoom, 1);
        } else if (myRoom.roomStage === 2.4) {
            buildContainerCaches(myRoom);
            buildContainerBank(myRoom);
        } else if (myRoom.roomStage === 2.8) {
            buildExtensions(myRoom, 10);
        } else if (myRoom.roomStage === 3.3) {
            buildExtensions(myRoom, 20);
        } else if (myRoom.roomStage === 3.6) {
            // TODO: Build storage
        }
    }
};

function roomNeedsFirstSpawn(myRoom: MyRoom): void {
    // TODO: Code this
    console.log("ATTENTION: Build your first spawn");
}

function buildContainerBank(myRoom: MyRoom): void {
    const roomFlags: Flag[] = getRoomsFlags(myRoom);
    for (let i = 0; i < roomFlags.length; i++) {
        const roomFlag: Flag = roomFlags[i];
        const flagNameSplit: string[] = getFlagNameSplit(roomFlag);
        if (flagNameSplit[0] === "cont" &&
            flagNameSplit[1] === "bank") {
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
            if (result === OK) {
                console.log("LOG: Placed container bank construction site");
                roomFlag.remove();
                if (myRoom.bankPos == null) {
                    myRoom.bankPos = {
                        x: roomFlag.pos.x,
                        y: roomFlag.pos.y,
                        roomName: myRoom.name
                    };
                } else {
                    console.log("ERR: Placed a container bank but the room already has a bank");
                }
            } else {
                console.log("ERR: Placing a container bank construction site errored");
            }
        }
    }
}

function buildContainerCaches(myRoom: MyRoom): void {
    const roomFlags: Flag[] = getRoomsFlags(myRoom);
    for (let i = 0; i < roomFlags.length; i++) {
        const roomFlag: Flag = roomFlags[i];
        const flagNameSplit: string[] = getFlagNameSplit(roomFlag);
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
}

function buildExtensions(myRoom: MyRoom, numberOfExtensionsToBuild: number): void {
    const roomFlags: Flag[] = getRoomsFlags(myRoom);
    for (let i = 0; i < roomFlags.length; i++) {
        const roomFlag: Flag = roomFlags[i];
        const flagNameSplit: string[] = getFlagNameSplit(roomFlag);
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
}

function buildTowers(myRoom: MyRoom, numberOfTowersToBuild: number): void {
    const roomFlags: Flag[] = getRoomsFlags(myRoom);
    for (let i = 0; i < roomFlags.length; i++) {
        const roomFlag: Flag = roomFlags[i];
        const flagNameSplit: string[] = getFlagNameSplit(roomFlag);
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
}

function isConstructable(terrain: RoomTerrain, roomName: string, x: number, y: number): boolean {
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

function getFlagNameSplit(flag: Flag): string[] {
    return flag.name.split("-");
}

function getRoomsFlags(myRoom: MyRoom): Flag[] {
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
