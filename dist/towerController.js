"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.towerController = {
    run: function (tower) {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure != null) {
            tower.repair(closestDamagedStructure);
        }
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile != null &&
            closestHostile.owner.username.toLowerCase() !== "mooseyman" &&
            closestHostile.owner.username.toLowerCase() !== "nimphious") {
            tower.attack(closestHostile);
        }
    }
};
