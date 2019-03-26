"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rcl1_role_all_1 = require("rcl1.role.all");
const tower_1 = require("tower");
const rcl2_controller_1 = require("rcl2.controller");
console.log("Starting script v3");
exports.loop = function () {
    let towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower_1.tower.run);
    let creepCount = 0;
    //Clear all dead creeps
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    if (Memory.myMemory.rclStage <= 1) {
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            creepCount++;
        }
        if (creepCount < 6) {
            let newCreep = spawnBasicWorker(Game.spawns.Spawn1);
            rcl1_role_all_1.rcl1RoleAll.run(newCreep);
        }
    }
    else if (Memory.myMemory.rclStage >= 2) {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            let creepsInThisRoom = [];
            for (let creepName in Game.creeps) {
                if (Game.creeps[creepName].room.name == roomName) {
                    creepsInThisRoom.push(Game.creeps[creepName]);
                }
            }
            rcl2_controller_1.rcl2Controller.run(room, creepsInThisRoom);
        }
    }
};
function spawnBasicWorker(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}
function getId() {
    let toReturn = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
