"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class MemoryController {
    static run() {
        this.clearDeadCreeps();
        this.ensureAllRoomsInMyMemory();
        this.validateRoomsInMyMemory();
        this.cleanUpTravelingCreeps();
        this.getBanks();
    }
    static clearBanks() {
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            myRoom.bank = null;
        }
    }
    static clearDeadCreeps() {
        for (const i in Memory.creeps) {
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }
    static ensureAllRoomsInMyMemory() {
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            let myRoom = null;
            if (room.controller == null ||
                room.controller.my === false) {
                continue;
            }
            for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
                const myExistingRoom = Memory.myMemory.myRooms[i];
                if (myExistingRoom != null &&
                    myExistingRoom.name === roomName) {
                    myRoom = myExistingRoom;
                }
            }
            if (myRoom == null) {
                console.log("LOG: Adding a new room " + roomName);
                const newMyRoom = {
                    name: roomName,
                    myCreeps: [],
                    spawns: [],
                    mySources: [],
                    roomStage: -1,
                    bankPos: null,
                    myExtensionPositions: [],
                    myTowerPositions: [],
                    bankLinkerName: null,
                    bankLink: null,
                    bank: null
                };
                const sources = room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    const source = sources[i];
                    newMyRoom.mySources.push({
                        id: source.id,
                        state: "NoCache",
                        minerName: null,
                        haulerNames: [],
                        cache: null,
                        link: null
                    });
                }
                const spawns = room.find(FIND_MY_SPAWNS);
                for (let i = 0; i < spawns.length; i++) {
                    const spawn = spawns[i];
                    newMyRoom.spawns.push({
                        position: global_functions_1.GlobalFunctions.roomPosToMyPos(spawn.pos),
                        name: spawn.name
                    });
                }
                Memory.myMemory.myRooms.push(newMyRoom);
            }
            else {
                const spawns = room.find(FIND_MY_SPAWNS);
                if (spawns.length !== myRoom.spawns.length) {
                    myRoom.spawns = [];
                    for (let i = 0; i < spawns.length; i++) {
                        const spawn = spawns[i];
                        myRoom.spawns.push({
                            position: global_functions_1.GlobalFunctions.roomPosToMyPos(spawn.pos),
                            name: spawn.name
                        });
                    }
                }
            }
        }
    }
    static validateRoomsInMyMemory() {
        for (let i = Memory.myMemory.myRooms.length - 1; i >= 0; i--) {
            const myRoom = Memory.myMemory.myRooms[i];
            const room = Game.rooms[myRoom.name];
            if (room == null) {
                console.log("LOG: Lost vision of a room " + myRoom.name);
                Memory.myMemory.myRooms.splice(i, 1);
                continue;
            }
            for (let j = myRoom.myCreeps.length - 1; j >= 0; j--) {
                const myCreep = myRoom.myCreeps[j];
                if (Game.creeps[myCreep.name] == null) {
                    this.handleCreepDying(myRoom, myCreep);
                    myRoom.myCreeps.splice(j, 1);
                }
            }
        }
    }
    static handleCreepDying(myRoom, myCreep) {
        if (myCreep.role === "Miner") {
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource = myRoom.mySources[i];
                if (mySource.minerName === myCreep.name) {
                    mySource.minerName = null;
                }
            }
            console.log("LOG: A Miner has died");
        }
        else if (myCreep.role === "Hauler") {
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource = myRoom.mySources[i];
                for (let j = mySource.haulerNames.length - 1; j >= 0; j--) {
                    if (mySource.haulerNames[j] === myCreep.name) {
                        mySource.haulerNames.splice(j, 1);
                    }
                }
            }
            console.log("LOG: A Hauler has died");
        }
        else if (myCreep.role === "Laborer") {
            console.log("LOG: A Laborer has died");
        }
        else if (myCreep.role === "Claimer") {
            console.log("LOG: A Claimer has died");
        }
        else if (myCreep.role === "BankLinker") {
            myRoom.bankLinkerName = null;
            console.log("LOG: A BankLinker has died");
        }
        else {
            console.log("LOG: A Creep with a weird role has died: " + myCreep.role);
        }
    }
    static cleanUpTravelingCreeps() {
        for (let i = Memory.myMemory.myTravelingCreeps.length - 1; i >= 0; i--) {
            const myCreep = Memory.myMemory.myTravelingCreeps[i];
            if (Game.creeps[myCreep.name] == null) {
                Memory.myMemory.myTravelingCreeps.splice(i, 1);
            }
        }
    }
    static getBanks() {
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            if (myRoom.bankPos != null) {
                const bankPos = global_functions_1.GlobalFunctions.myPosToRoomPos(myRoom.bankPos);
                const structures = bankPos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_STORAGE) {
                        myRoom.bank = structures[j];
                        break;
                    }
                }
            }
        }
    }
}
exports.MemoryController = MemoryController;
