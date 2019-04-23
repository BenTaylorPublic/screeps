"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GlobalFunctions {
    static getId() {
        const toReturn = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    }
    static calcBodyCost(body) {
        return body.reduce(function (cost, part) {
            return cost + BODYPART_COST[part];
        }, 0);
    }
    static generateBody(baseBody, bodyPartsToAdd, room, useBest) {
        const maxEnergyToUse = (useBest) ?
            room.energyCapacityAvailable :
            room.energyAvailable;
        let body = baseBody;
        while (true) {
            if (this.calcBodyCost(body) + this.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= 50) {
                body = body.concat(bodyPartsToAdd);
            }
            else {
                break;
            }
        }
        return body;
    }
    static amountOfStructure(room, structureConstant) {
        const extensions = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === structureConstant;
            }
        });
        return extensions.length;
    }
    static getRoomsFlags(myRoom) {
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
    }
    static buildExtensions(myRoom, numberOfExtensionsToBuild) {
        const roomFlags = this.getRoomsFlags(myRoom);
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
    }
    static buildTowers(myRoom, numberOfTowersToBuild) {
        const roomFlags = this.getRoomsFlags(myRoom);
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
    }
    static isConstructable(terrain, roomName, x, y) {
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
    }
    static roomPosToMyPos(roomPos) {
        return {
            x: roomPos.x,
            y: roomPos.y,
            roomName: roomPos.roomName
        };
    }
    static myPosToRoomPos(myPos) {
        return new RoomPosition(myPos.x, myPos.y, myPos.roomName);
    }
    static getBank(myRoom) {
        if (myRoom.bankPos == null) {
            return null;
        }
        const bankPos = this.myPosToRoomPos(myRoom.bankPos);
        const structures = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures.length; i++) {
            if (structures[i].structureType === STRUCTURE_STORAGE) {
                return structures[i];
                break;
            }
        }
        return null;
    }
    static isAllyUsername(username) {
        return ["mooseyman", "nimphious", "james1652"].indexOf(username.toLowerCase()) !== -1;
    }
    static findClosestSpawn(roomPos) {
        return Game.spawns["Spawn1"];
        let spawnToReturn = null;
        let closestDistance = 9999;
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            for (let j = 0; j < myRoom.spawns.length; j++) {
                const mySpawn = myRoom.spawns[j];
                const mySpawnRoomPos = this.myPosToRoomPos(mySpawn.position);
                const distance = mySpawnRoomPos.getRangeTo(roomPos);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    spawnToReturn = Game.spawns[mySpawn.name];
                }
            }
        }
        return spawnToReturn;
    }
}
exports.GlobalFunctions = GlobalFunctions;
