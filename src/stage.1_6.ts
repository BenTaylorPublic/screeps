import { GlobalFunctions } from "./global.functions";

// tslint:disable-next-line: class-name
export class Stage1_6 {
    /*
    1.6 ->  2   : Room has caches length >= source amount
    1.6 <-  2   : Room has caches length < source amount
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        const amountOfSource: number = room.find(FIND_SOURCES).length;
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) >= amountOfSource) {
            myRoom.roomStage = 2;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        const amountOfSource: number = room.find(FIND_SOURCES).length;
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) < amountOfSource) {
            myRoom.roomStage = 1.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        let roomFlags: Flag[] = GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit.length === 0) {
                console.log("NAME: " + roomFlag.name);
            } else if (flagNameSplit[0] !== "cont") {
                roomFlags = roomFlags.slice(i, 1);
            }
        }

        let flagsPlaced: number = 0;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
            if (result === OK) {
                let placedFully: boolean = false;
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource: MySource = myRoom.mySources[j];
                    const source: Source | null = Game.getObjectById<Source>(mySource.id);
                    if (source == null) {
                        console.log("ERR: Source was null when trying to get it by ID");
                    } else {
                        if (source.pos.inRangeTo(roomFlag.pos, 1)) {
                            mySource.cache = {
                                pos: {
                                    x: roomFlag.pos.x,
                                    y: roomFlag.pos.y,
                                    roomName: myRoom.name
                                },
                                id: null
                            };
                            mySource.state = "Cache";
                            flagsPlaced++;
                            placedFully = true;
                        } // Else it's hopefully the other source in the room...
                    }
                }
                if (placedFully) {
                    console.log("LOG: Placed container cache construction site");
                    roomFlag.remove();
                } else {
                    console.log("ERR: Placed a construction site at a flag but couldn't find a source to give it to");
                }

            } else {
                console.log("ERR: Placing a container cache construction site errored");
            }
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.cache != null &&
                mySource.cache.id == null) {
                const cachePos: RoomPosition = GlobalFunctions.myPosToRoomPos(mySource.cache.pos);
                const structures: Structure<StructureConstant>[] = cachePos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_CONTAINER) {
                        mySource.cache.id = structures[j].id;
                        break;
                    }
                }
            }
        }

        if (flagsPlaced !== myRoom.mySources.length &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs cache container flag");
        }
    }
}
