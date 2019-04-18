import { globalFunctions } from "global.functions";

export const roomTowerController: any = {
    run: function (tower: StructureTower) {

        const closestDamagedStructure: Structure | null = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure != null) {
            tower.repair(closestDamagedStructure);
            return;
        }

        const hostileCreeps: Creep[] = tower.room.find(FIND_HOSTILE_CREEPS);
        if (hostileCreeps.length >= 1) {

            for (let i = hostileCreeps.length - 1; i >= 0; i--) {
                const possibleHostileCreep: Creep = hostileCreeps[i];
                if (globalFunctions.isAllyUsername(possibleHostileCreep.owner.username)) {
                    hostileCreeps.slice(i, 1);
                }
            }

            let target: Creep | null = null;
            for (let i = 0; i < hostileCreeps.length; i++) {
                const hostileCreep: Creep = hostileCreeps[i];
                let healer: boolean = false;
                for (let j = 0; j < hostileCreep.body.length; j++) {
                    const bodyPart: BodyPartDefinition = hostileCreep.body[j];
                    if (bodyPart.type === HEAL) {
                        healer = true;
                        break;
                    }
                }

                if (healer) {
                    target = hostileCreep;
                    break;
                } else if (target == null) {
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
