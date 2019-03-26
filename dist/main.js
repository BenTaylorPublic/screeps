"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_harvester_1 = require("role.harvester");
const role_upgrader_1 = require("role.upgrader");
const role_builder_1 = require("role.builder");
const tower_1 = require("tower");
let globalId = 0;
exports.loop = function () {
    let towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower_1.tower.run);
    let harvesterCount = 0;
    let upgraderCount = 0;
    let builderCount = 0;
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role === "harvester") {
            role_harvester_1.roleHarvester.run(creep);
            harvesterCount++;
        }
        else if (creep.memory.role === "upgrader") {
            role_upgrader_1.roleUpgrader.run(creep);
            upgraderCount++;
        }
        else if (creep.memory.role === "builder") {
            role_builder_1.roleBuilder.run(creep);
            builderCount++;
        }
    }
    if (harvesterCount < 2) {
        let newCreep = spawnHarvester(Game.spawns.Spawn1);
        role_harvester_1.roleHarvester.run(newCreep);
    }
    else if (upgraderCount < 2) {
        let newCreep = spawnUpgrader(Game.spawns.Spawn1);
        role_upgrader_1.roleUpgrader.run(newCreep);
    }
    else if (builderCount < 2) {
        let newCreep = spawnBuilder(Game.spawns.Spawn1);
        role_builder_1.roleBuilder.run(newCreep);
    }
};
function spawnHarvester(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "harvester" } });
    return Game.creeps["Creep" + id];
}
function spawnUpgrader(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "upgrader" } });
    return Game.creeps["Creep" + id];
}
function spawnBuilder(spawn) {
    let id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "builder" } });
    return Game.creeps["Creep" + id];
}
function getId() {
    let toReturn = globalId;
    globalId++;
    return toReturn;
}
