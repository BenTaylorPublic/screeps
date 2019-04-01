"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_logic1_1 = require("controller.logic1");
console.log("Script reloaded");
setupMyMemory();
exports.loop = function () {
    clearDeadCreeps();
    ensureAllRoomsInMyMemory();
    validateRoomsInMyMemory();
    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        const myRoom = Memory.myMemory.myRooms[i];
        controller_logic1_1.controllerLogic1.run(myRoom);
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
        let alreadyInMemory = false;
        if (room.controller == null ||
            room.controller.my === false) {
            //No need to process rooms that don't have controllers or are not mine
            //We only have access to these rooms through travelers (probs)
            alreadyInMemory = true;
        }
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            if (myRoom.name === roomName) {
                alreadyInMemory = true;
            }
        }
        if (!alreadyInMemory) {
            //Add it
            console.log("Adding a new room " + roomName);
            const newMyRoom = {
                name: roomName,
                myCreeps: [],
                spawnName: null,
                mySources: [],
                myContainers: [],
                roomStage: 0,
                manuallyPlacedBase: false,
                baseCenter: null
            };
            const sources = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];
                newMyRoom.mySources.push({ id: source.id, cacheContainerId: null, minerName: null });
            }
            //Initially add all existing creeps
            for (const creepName in Game.creeps) {
                const creep = Game.creeps[creepName];
                creep.memory.assignedRoomName = roomName;
                if (creep.memory.mining == null) {
                    creep.memory.mining = true;
                }
                newMyRoom.myCreeps.push(creep.memory);
            }
            //Check the spawn
            const spawns = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_SPAWN }
            });
            if (spawns.length >= 1) {
                newMyRoom.spawnName = spawns[0].name;
            }
            Memory.myMemory.myRooms.push(newMyRoom);
        }
    }
}
function validateRoomsInMyMemory() {
    //Validation of the myRooms
    for (let i = Memory.myMemory.myRooms.length - 1; i >= 0; i--) {
        const myRoom = Memory.myMemory.myRooms[i];
        const room = Game.rooms[myRoom.name];
        if (room == null) {
            console.log("Lost vision of a room " + myRoom.name);
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
        console.log("A Miner has died");
    }
    else if (myCreep.role === "Hauler") {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const myContainer = myRoom.myContainers[i];
            if (myContainer.role === "SourceCache" &&
                myContainer.haulerNames != null) { //source cache
                for (let j = myContainer.haulerNames.length - 1; j >= 0; j--) {
                    if (myContainer.haulerNames[j] === myCreep.name) {
                        myContainer.haulerNames.splice(j, 1);
                    }
                }
            }
        }
        console.log("A Hauler has died");
    }
    else if (myCreep.role === "MinerAndWorker") {
        console.log("A MinerAndWorker has died");
    }
    else if (myCreep.role === "Laborer") {
        console.log("A Laborer has died");
    }
}
function setupMyMemory() {
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: []
        };
    }
}
