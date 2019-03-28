"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_logic1_1 = require("controller.logic1");
console.log("Starting script v16");
Memory.myMemory.myRooms = [];
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
                spawnId: undefined,
                mySources: [],
                myContainers: []
            };
            const sources = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                const source = sources[i];
                newMyRoom.mySources.push({ id: source.id, cacheContainerId: undefined });
            }
            //myCreeps, spawnId, myContainers will be populated by logic when they're created
            //Initially add all existing creeps
            for (const creepName in Game.creeps) {
                const creep = Game.creeps[creepName];
                creep.memory.assignedRoomName = roomName;
                if (creep.memory.role == null) {
                    creep.memory.role = "BasicWorker";
                }
                newMyRoom.myCreeps.push({
                    name: creepName,
                    role: creep.memory.role,
                    assignedRoomName: roomName
                });
            }
            Memory.myMemory.myRooms.push(newMyRoom);
        }
    }
}
function validateRoomsInMyMemory() {
    //Validation of the myRooms
    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        const myRoom = Memory.myMemory.myRooms[i];
        const room = Game.rooms[myRoom.name];
        if (room == null) {
            console.error("Lost vision of a room " + name);
            continue;
        }
        for (let j = myRoom.myCreeps.length - 1; j >= 0; j--) {
            const creepName = myRoom.myCreeps[j].name;
            if (Game.creeps[creepName] == null) {
                //Creep is dead
                myRoom.myCreeps.splice(j, 1);
                console.log("Creep is dead and has been removed from a room");
            }
        }
    }
}
