"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rcl1_role_all_1 = require("rcl1.role.all");
const tower_1 = require("tower");
let globalId = 0;
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
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        rcl1_role_all_1.rcl1RoleAll.run(creep);
        creepCount++;
    }
    if (creepCount < 6) {
        let newCreep = spawnHarvester(Game.spawns.Spawn1);
        rcl1_role_all_1.rcl1RoleAll.run(newCreep);
    }
};
function spawnHarvester(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "rcl1", harvesting: true } });
    return Game.creeps["Creep" + id];
}
function getId() {
    let toReturn = globalId;
    globalId++;
    return toReturn;
}
