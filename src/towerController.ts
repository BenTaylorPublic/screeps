
export const towerController: any = {
    run: function (tower: StructureTower) {
        const closestDamagedStructure: Structure | null = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure != null) {
            tower.repair(closestDamagedStructure);
        }

        const closestHostile: Creep | null = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile != null &&
            closestHostile.owner.username.toLowerCase() !== "mooseyman" &&
            closestHostile.owner.username.toLowerCase() !== "nimphious") {
            tower.attack(closestHostile);
        }
    }
};
