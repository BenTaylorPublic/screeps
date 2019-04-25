"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
const stage_functions_1 = require("./stage.functions");
class Stage4_6 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_LINK) >= 2) {
            myRoom.roomStage = 4.8;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.8");
            return true;
        }
        return false;
    }
    static down(myRoom, room) {
        if (global_functions_1.GlobalFunctions.amountOfStructure(room, STRUCTURE_LINK) < 2) {
            myRoom.roomStage = 4.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.6");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        stage_functions_1.StageFunctions.setupSourceLink(myRoom);
        let roomFlags = global_functions_1.GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "link" ||
                flagNameSplit[1] !== "bank") {
                roomFlags = roomFlags.slice(i, 1);
            }
        }
        let placedBankLink = false;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_LINK);
            if (result === OK) {
                myRoom.bankLink = {
                    pos: global_functions_1.GlobalFunctions.roomPosToMyPos(roomFlag.pos),
                    id: null
                };
                roomFlag.remove();
                placedBankLink = true;
            }
            else {
                console.log("ERR: Placing a bank link construction site errored");
            }
        }
        if (myRoom.bankLink != null) {
            const linkPos = global_functions_1.GlobalFunctions.myPosToRoomPos(myRoom.bankLink.pos);
            const structures = linkPos.lookFor(LOOK_STRUCTURES);
            for (let j = 0; j < structures.length; j++) {
                if (structures[j].structureType === STRUCTURE_LINK) {
                    myRoom.bankLink.id = structures[j].id;
                    break;
                }
            }
        }
        if (!placedBankLink &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs bank link flag");
        }
    }
}
exports.Stage4_6 = Stage4_6;
