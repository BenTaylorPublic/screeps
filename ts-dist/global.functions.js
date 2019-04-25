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
    static isConstructable(terrain, roomName, x, y) {
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
    static isAllyUsername(username) {
        return ["mooseyman", "nimphious", "james1652"].indexOf(username.toLowerCase()) !== -1;
    }
    static findClosestSpawn(roomPos) {
        let spawnToReturn = null;
        let closestDistance = 9999;
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            if (myRoom.spawns.length >= 1) {
                const distance = Game.map.getRoomLinearDistance(roomPos.roomName, myRoom.name);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    spawnToReturn = Game.spawns[myRoom.spawns[0].name];
                }
            }
        }
        return spawnToReturn;
    }
}
exports.GlobalFunctions = GlobalFunctions;
