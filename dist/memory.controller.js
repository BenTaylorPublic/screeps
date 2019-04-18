"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.memoryController = {
    run: function () {
        clearDeadCreeps();
        ensureAllRoomsInMyMemory();
        validateRoomsInMyMemory();
    }
};
function clearDeadCreeps() {
    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}
function ensureAllRoomsInMyMemory() {
    //Ensuring all the rooms are in Memory.myMemory.myRooms
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        let myRoom = null;
        if (room.controller == null ||
            room.controller.my === false) {
            //No need to process rooms that don't have controllers or are not mine
            //We only have access to these rooms through travelers (probs)
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
            //Add it
            console.log("LOG: Adding a new room " + roomName);
            const newMyRoom = {
                name: roomName,
                myCreeps: [],
                spawns: [],
                mySources: [],
                roomStage: 0,
                bankPos: null,
                myExtensionPositions: [],
                myTowerPositions: []
            };
            const sources = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];
                newMyRoom.mySources.push({
                    id: source.id,
                    minerName: null,
                    haulerNames: [],
                    cachePos: null
                });
            }
            const spawns = room.find(FIND_MY_SPAWNS);
            for (let i = 0; i < spawns.length; i++) {
                const spawn = spawns[i];
                newMyRoom.spawns.push({
                    position: global_functions_1.globalFunctions.roomPosToMyPos(spawn.pos),
                    name: spawn.name
                });
            }
            Memory.myMemory.myRooms.push(newMyRoom);
        }
        else {
            //Already in memory
            //If the room has more or less spawns than in the MyRoom, add them to it
            const spawns = room.find(FIND_MY_SPAWNS);
            if (spawns.length !== myRoom.spawns.length) {
                myRoom.spawns = [];
                for (let i = 0; i < spawns.length; i++) {
                    const spawn = spawns[i];
                    myRoom.spawns.push({
                        position: global_functions_1.globalFunctions.roomPosToMyPos(spawn.pos),
                        name: spawn.name
                    });
                }
            }
        }
    }
}
function validateRoomsInMyMemory() {
    //Validation of the myRooms
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
                handleCreepDying(myRoom, myCreep);
                myRoom.myCreeps.splice(j, 1);
            }
        }
    }
}
function handleCreepDying(myRoom, myCreep) {
    //Creep is dead
    if (myCreep.role === "Miner") {
        //Need to check what source it was on
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
    else {
        console.log("LOG: A Creep with a weird role has died: " + myCreep.role);
    }
}
