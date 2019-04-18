"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalFunctions = {
    getId: function () {
        const toReturn = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    },
    calcBodyCost: function (body) {
        return body.reduce(function (cost, part) {
            return cost + BODYPART_COST[part];
        }, 0);
    },
    generateBody: function (baseBody, bodyPartsToAdd, room, useBest) {
        const maxEnergyToUse = (useBest) ?
            room.energyCapacityAvailable :
            room.energyAvailable;
        let body = baseBody;
        while (true) {
            if (exports.globalFunctions.calcBodyCost(body) + exports.globalFunctions.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= 50) {
                body = body.concat(bodyPartsToAdd);
            }
            else {
                break;
            }
        }
        return body;
    },
    amountOfStructure: function (room, structureConstant) {
        const extensions = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return extensions.length;
    },
    getRoomsFlags: function (myRoom) {
        const result = [];
        const flagNames = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag = Game.flags[flagNames[i]];
            if (flag.room != null &&
                flag.room.name === myRoom.name) {
                result.push(flag);
            }
        }
        return result;
    },
    buildExtensions: function (myRoom, numberOfExtensionsToBuild) {
        const roomFlags = exports.globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] === "ex") {
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
    },
    buildTowers: function (myRoom, numberOfTowersToBuild) {
        const roomFlags = exports.globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag = roomFlags[i];
            const flagNameSplit = roomFlag.name.split("-");
            if (flagNameSplit[0] === "tower") {
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
    },
    isConstructable: function (terrain, roomName, x, y) {
        // TODO: Remove terrain as a param
        if (x < 0 || x > 49 || y < 0 || y > 49) {
            return false;
        }
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
            const roomPos = new RoomPosition(x, y, roomName);
            const structures = roomPos.lookFor(LOOK_STRUCTURES);
            if (structures.length !== 0) {
                return false;
            }
            else {
                return true;
            }
        }
        return false;
    },
    roomPosToMyPos: function (roomPos) {
        return {
            x: roomPos.x,
            y: roomPos.y,
            roomName: roomPos.roomName
        };
    },
    myPosToRoomPos: function (myPos) {
        return new RoomPosition(myPos.x, myPos.y, myPos.roomName);
    },
    getBank: function (myRoom) {
        if (myRoom.bankPos == null) {
            return null;
        }
        const bankPos = exports.globalFunctions.myPosToRoomPos(myRoom.bankPos);
        const structures = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType === STRUCTURE_STORAGE) {
                return structures[i];
                break;
            }
        }
        return null;
    },
    isAllyUsername(username) {
        return ["mooseyman", "nimphious"].indexOf(username.toLowerCase()) !== -1;
    }
};
