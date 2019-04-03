"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomTowerController = {
    run: function (tower) {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure != null) {
            tower.repair(closestDamagedStructure);
            return;
        }
        const hostileCreeps = tower.room.find(FIND_HOSTILE_CREEPS);
        if (hostileCreeps.length >= 1) {
            const allyList = ["mooseyman", "nimphious"];
            for (let i = hostileCreeps.length - 1; i >= 0; i--) {
                const possibleHostileCreep = hostileCreeps[i];
                for (let j = 0; j < allyList.length; j++) {
                    if (possibleHostileCreep.owner.username.toLowerCase() === allyList[j]) {
                        hostileCreeps.slice(i, 1);
                        break;
                    }
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
};
