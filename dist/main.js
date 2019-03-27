"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basicworker_role_all_1 = require("basicworker.role.all");
const dev_controller_1 = require("dev.controller");
console.log("Starting script v8");
exports.loop = function () {
    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    if (Memory.myMemory.prod === false) {
        //Prod
        let creepCount = 0;
        for (const name in Game.creeps) {
            const creep = Game.creeps[name];
            basicworker_role_all_1.basicWorkerRole.run(creep);
            creepCount++;
        }
        if (creepCount < 6) {
            const newCreep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            basicworker_role_all_1.basicWorkerRole.run(newCreep);
        }
    }
    else if (Memory.myMemory.prod === true) {
        //Dev
        //Ensuring all the rooms are in Memory.myMemory.myRooms
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            let alreadyInMemory = false;
            if (room.controller == null ||
                room.controller.my) {
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
                    creep.memory.assignedRoomName = roomName;
                    newMyRoom.myCreeps.push({
                        name: creepName,
                        role: creep.memory.role,
                        assignedRoomName: roomName
                    });
                }
            }
        }
        //Validation of the myRooms
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            const room = Game.rooms[myRoom.name];
            if (room == null) {
                console.error("Lost vision of a room " + name);
                continue;
            }
            for (let j = 0; j < myRoom.myCreeps.length; j++) {
                const creepName = myRoom.myCreeps[j].name;
                if (Game.creeps[creepName] == null) {
                    //Creep is dead
                    delete myRoom.myCreeps[j];
                    j--;
                    console.log("Creep is dead and has been removed from a room");
                }
            }
        }
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            dev_controller_1.devController.run(myRoom);
        }
    }
};
function spawnBasicWorker(spawn) {
    const id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { assignedRoomName: spawn.room.name, role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}
function getId() {
    const toReturn = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
