
export const towerController: any = {
    run: function (tower: StructureTower) {

        const hostiles: Creep[] = tower.room.find(FIND_HOSTILE_CREEPS);
        let target: Creep | null = null;
        for (let i = 0; i < hostiles.length; i++) {
            const creep: Creep = hostiles[i];
            let healer: boolean = false;
            for (let j = 0; j < creep.body.length; j++) {
                const bodyPart: BodyPartDefinition = creep.body[j];
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
        } else {
            const closestDamagedStructure: Structure | null = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure != null) {
                tower.repair(closestDamagedStructure);
            }
        }
    }
};
