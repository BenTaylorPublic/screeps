"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var role_harvester_1 = require("role.harvester");
var role_upgrader_1 = require("role.upgrader");
var role_builder_1 = require("role.builder");
var tower_1 = require("tower");
var globalId = 0;
exports.loop = function () {
    var towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
    towers.forEach(tower_1.tower.run);
    var harvesterCount = 0;
    var upgraderCount = 0;
    var builderCount = 0;
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
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
        var newCreep = spawnHarvester(Game.spawns.Spawn1);
        role_harvester_1.roleHarvester.run(newCreep);
    }
    else if (upgraderCount < 2) {
        var newCreep = spawnUpgrader(Game.spawns.Spawn1);
        role_upgrader_1.roleUpgrader.run(newCreep);
    }
    else if (builderCount < 2) {
        var newCreep = spawnBuilder(Game.spawns.Spawn1);
        role_builder_1.roleBuilder.run(newCreep);
    }
};
function spawnHarvester(spawn) {
    var id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "harvester" } });
    return Game.creeps["Creep" + id];
}
function spawnUpgrader(spawn) {
    var id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "upgrader" } });
    return Game.creeps["Creep" + id];
}
function spawnBuilder(spawn) {
    var id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { role: "builder" } });
    return Game.creeps["Creep" + id];
}
function getId() {
    var toReturn = globalId;
    globalId++;
    return toReturn;
}
