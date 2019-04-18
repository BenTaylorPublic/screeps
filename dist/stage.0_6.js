"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage0_6 = {
    /*
    0.6 ->  1   : Room has caches length >= source amount
    0.6 <-  1   : Room has caches length < source amount
    */
    up: function (myRoom, room) {
        const amountOfSource = room.find(FIND_SOURCES).length;
        if (global_functions_1.globalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) >= amountOfSource) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        const amountOfSource = room.find(FIND_SOURCES).length;
        if (global_functions_1.globalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) < amountOfSource) {
            myRoom.roomStage = 0.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.6");
            return true;
        }
        return false;
    },
    step: function (myRoom) {
        const roomFlags = global_functions_1.globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] === "cont") {
                const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
                if (result === OK) {
                    console.log("LOG: Placed container cache construction site");
                    roomFlag.remove();
                    for (let j = 0; j < myRoom.mySources.length; j++) {
                        const mySource = myRoom.mySources[j];
                        const source = Game.getObjectById(mySource.id);
                        if (source == null) {
                            console.log("ERR: Source was null when trying to get it by ID");
                        }
                        else {
                            if (source.pos.inRangeTo(roomFlag.pos, 1)) {
                                mySource.cachePos = {
                                    x: roomFlag.pos.x,
                                    y: roomFlag.pos.y,
                                    roomName: myRoom.name
                                };
                            } // Else it's hopefully the other source in the room...
                        }
                    }
                }
                else {
                    console.log("ERR: Placing a container cache construction site errored");
                }
            }
        }
    }
};
