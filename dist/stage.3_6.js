"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.stage3_6 = {
    /*
    3.6 ->  4   : Room has a storage bank
    3.6 <-  4   : Room does not have a storage bank
    */
    up: function (myRoom, room) {
        if (global_functions_1.globalFunctions.amountOfStructure(room, STRUCTURE_STORAGE) >= 1) {
            myRoom.roomStage = 4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4");
            return true;
        }
        return false;
    },
    down: function (myRoom, room) {
        if (global_functions_1.globalFunctions.amountOfStructure(room, STRUCTURE_STORAGE) < 1) {
            myRoom.roomStage = 3.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3.6");
            return true;
        }
        return false;
    },
    step: function (myRoom, room) {
        const storage = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        });
        if (storage.length === 1) {
            myRoom.bankPos = {
                x: storage[0].pos.x,
                y: storage[0].pos.y,
                roomName: myRoom.name
            };
            return;
        }
        const roomFlags = global_functions_1.globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            if (roomFlag.name === "storage") {
                const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_STORAGE);
                if (result === OK) {
                    console.log("LOG: Placed storage bank construction site");
                    roomFlag.remove();
                }
                else {
                    console.log("ERR: Placing a storage bank construction site errored");
                }
            }
        }
    }
};
