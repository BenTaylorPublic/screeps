"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class Stage1_6 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        const amountOfSource = room.find(FIND_SOURCES).length;
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) >= amountOfSource) {
            myRoom.roomStage = 2;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        const amountOfSource = room.find(FIND_SOURCES).length;
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) < amountOfSource) {
            myRoom.roomStage = 1.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.6");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        let roomFlags = global_functions_1.GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "cont") {
                roomFlags = roomFlags.slice(i, 1);
            }
        }
        let flagsPlaced = 0;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
            if (result === OK) {
                let placedFully = false;
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource = myRoom.mySources[j];
                    const source = Game.getObjectById(mySource.id);
                    if (source == null) {
                        console.log("ERR: Source was null when trying to get it by ID");
                    }
                    else {
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
                        }
                    }
                }
                if (placedFully) {
                    console.log("LOG: Placed container cache construction site");
                    roomFlag.remove();
                }
                else {
                    console.log("ERR: Placed a construction site at a flag but couldn't find a source to give it to");
                }
            }
            else {
                console.log("ERR: Placing a container cache construction site errored");
            }
        }
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.cache != null &&
                mySource.cache.id == null) {
                const cachePos = global_functions_1.GlobalFunctions.myPosToRoomPos(mySource.cache.pos);
                const structures = cachePos.lookFor(LOOK_STRUCTURES);
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
exports.Stage1_6 = Stage1_6;
