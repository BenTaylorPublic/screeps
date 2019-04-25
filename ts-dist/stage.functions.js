"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class StageFunctions {
    static buildExtensions(myRoom, numberOfExtensionsToBuild) {
        let roomFlags = global_functions_1.GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "ex") {
                roomFlags = roomFlags.slice(i, 1);
            }
        }
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            const extensionNumber = Number(flagNameSplit[1]);
            if (extensionNumber <= numberOfExtensionsToBuild) {
                const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_EXTENSION);
                if (result === OK) {
                    console.log("LOG: Placed extension construction site");
                    myRoom.myExtensionPositions.push({
                        x: roomFlag.pos.x,
                        y: roomFlag.pos.y,
                        roomName: myRoom.name
                    });
                    roomFlag.remove();
                }
                else {
                    console.log("ERR: Placing a extension construction site errored");
                }
            }
        }
    }
    static buildTowers(myRoom, numberOfTowersToBuild) {
        let roomFlags = global_functions_1.GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "tower") {
                roomFlags = roomFlags.slice(i, 1);
            }
        }
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            const towerNumber = Number(flagNameSplit[1]);
            if (towerNumber <= numberOfTowersToBuild) {
                const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_TOWER);
                if (result === OK) {
                    console.log("LOG: Placed tower construction site");
                    myRoom.myTowerPositions.push({
                        x: roomFlag.pos.x,
                        y: roomFlag.pos.y,
                        roomName: myRoom.name
                    });
                    roomFlag.remove();
                }
                else {
                    console.log("ERR: Placing a tower construction site errored");
                }
            }
        }
    }
    static setupSourceLink(myRoom) {
        let roomFlags = global_functions_1.GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "link" ||
                flagNameSplit[1] === "bank") {
                roomFlags = roomFlags.slice(i, 1);
            }
        }
        let placedFully = false;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const result = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_LINK);
            if (result === OK) {
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource = myRoom.mySources[j];
                    const source = Game.getObjectById(mySource.id);
                    if (source == null) {
                        console.log("ERR: Source was null when trying to get it by ID");
                    }
                    else {
                        if (source.pos.inRangeTo(roomFlag.pos, 2)) {
                            mySource.link = {
                                pos: global_functions_1.GlobalFunctions.roomPosToMyPos(roomFlag.pos),
                                id: null
                            };
                            placedFully = true;
                        }
                    }
                }
                if (placedFully) {
                    console.log("LOG: Placed source link construction site");
                    roomFlag.remove();
                }
                else {
                    console.log("ERR: Placed a construction site at a flag but couldn't find a source to give it to");
                }
            }
            else {
                console.log("ERR: Placing a source link construction site errored");
            }
        }
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.link != null &&
                mySource.link.id == null) {
                const linkPos = global_functions_1.GlobalFunctions.myPosToRoomPos(mySource.link.pos);
                const structures = linkPos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_LINK) {
                        mySource.link.id = structures[j].id;
                        mySource.state = "Link";
                        break;
                    }
                }
            }
        }
        if (!placedFully &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs source link flag");
        }
    }
}
exports.StageFunctions = StageFunctions;
