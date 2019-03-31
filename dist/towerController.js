"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.towerController = {
    run: function (tower) {
        const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
        let target = null;
        for (let i = 0; i < hostiles.length; i++) {
            const creep = hostiles[i];
            let healer = false;
            for (let j = 0; j < creep.body.length; j++) {
                const bodyPart = creep.body[j];
                if (bodyPart.type === HEAL) {
                    healer = true;
                    break;
                }
            }
            if (healer) {
                target = creep;
                break;
            }
        }
        if (target != null &&
            target.owner.username.toLowerCase() !== "mooseyman" &&
            target.owner.username.toLowerCase() !== "nimphious") {
            tower.attack(target);
        }
        else {
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure != null) {
                tower.repair(closestDamagedStructure);
            }
        }
    }
};
