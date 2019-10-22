import {HelperFunctions} from "../../global/helper-functions";
import {Constants} from "../../global/constants";
import {ReportController} from "../../reporting/report-controller";

export class RoomTowerController {
    public static run(tower: StructureTower): void {

        const hostileCreeps: Creep[] = tower.room.find(FIND_HOSTILE_CREEPS);
        if (hostileCreeps.length >= 1) {

            for (let i = hostileCreeps.length - 1; i >= 0; i--) {
                const possibleHostileCreep: Creep = hostileCreeps[i];
                if (HelperFunctions.isAllyUsername(possibleHostileCreep.owner.username)) {
                    hostileCreeps.splice(i, 1);
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
                ReportController.log("DEFENCE", "Tower attacking target with name " + target.name + " Owner: " + target.owner.username);
                return;
            }
        }
        const closestDamagedStructure: Structure | null = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                if (structure.structureType !== STRUCTURE_WALL &&
                    structure.structureType !== STRUCTURE_RAMPART) {
                    return structure.hits < structure.hitsMax;
                } else {
                    return structure.hits < Constants.WALL_AND_RAMPART_GOAL_HEALTH;
                }
            }
        });
        if (closestDamagedStructure != null &&
            tower.energy >= tower.energyCapacity * Constants.TOWER_REPAIR_ABOVE_PERCENT) {
            tower.repair(closestDamagedStructure);
            return;
        }

    }
}
