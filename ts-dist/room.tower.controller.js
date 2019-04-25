"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class RoomTowerController {
    static run(tower) {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure != null) {
            tower.repair(closestDamagedStructure);
            return;
        }
        let hostileCreeps = tower.room.find(FIND_HOSTILE_CREEPS);
        if (hostileCreeps.length >= 1) {
            for (let i = hostileCreeps.length - 1; i >= 0; i--) {
                const possibleHostileCreep = hostileCreeps[i];
                if (global_functions_1.GlobalFunctions.isAllyUsername(possibleHostileCreep.owner.username)) {
                    hostileCreeps = hostileCreeps.slice(i, 1);
                }
            }
            let target = null;
            for (let i = 0; i < hostileCreeps.length; i++) {
                const hostileCreep = hostileCreeps[i];
                let healer = false;
                for (let j = 0; j < hostileCreep.body.length; j++) {
                    const bodyPart = hostileCreep.body[j];
                    if (bodyPart.type === HEAL) {
                        healer = true;
                        break;
                    }
                }
                if (healer) {
                    target = hostileCreep;
                    break;
                }
                else if (target == null) {
                    target = hostileCreep;
                }
            }
            if (target != null) {
                tower.attack(target);
                return;
            }
        }
    }
}
exports.RoomTowerController = RoomTowerController;
