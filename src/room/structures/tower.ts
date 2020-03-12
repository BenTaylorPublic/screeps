import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {EmpireHelper} from "../../global/helpers/empire-helper";

export class RoomTowerController {
    public static run(myRoom: MyRoom, room: Room): void {
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_TOWER,
                my: true
            }
        });

        if (towers.length === 0) {
            return;
        }
        const otherCreeps: FindOtherCreepsResult = this.findOtherCreeps(room);

        if (otherCreeps.hostileCreeps.length > 0 &&
            (room.controller as StructureController).safeMode == null &&
            !otherCreeps.healers) {
            const target: Creep = this.getBestCreepTarget(otherCreeps.hostileCreeps);
            if (target.owner.username !== "Invader" &&
                !target.name.includes("Harvester_mine")) {
                ReportController.email("Tower attacking target with name " + target.name + " Owner: " + target.owner.username + " in " + LogHelper.roomNameAsLink(room.name),
                    ReportCooldownConstants.FIVE_MINUTE);
            }

            //Fire them all
            for (let i = 0; i < towers.length; i++) {
                this.attackIfEnoughEnergy(towers[i], target);
            }
        } else {
            const damagedStructures: AnyStructure[] = room.find(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    if (structure.structureType !== STRUCTURE_WALL &&
                        structure.structureType !== STRUCTURE_RAMPART) {
                        return structure.hits < structure.hitsMax &&
                            !otherCreeps.healers; //Only heal defensive structures if there's healer present
                    } else {
                        return structure.hits < Constants.WALL_AND_RAMPART_GOAL_HEALTH;
                    }
                }
            });

            if (damagedStructures.length !== 0) {

                if (Constants.REPAIR_ONLY_ON_ODD_THOUSAND &&
                    otherCreeps.hostileCreeps.length === 0 &&
                    !Memory.myMemory.empire.oddThousand) {
                    //Only repair when the odd thousand is true
                    return;
                }
                const minimumEnergyToRepair: number = (otherCreeps.hostileCreeps.length === 0) ? 500 : 10;

                //Break once 1 tower has repaired
                //This stoped all 6 towers repairing once, so the stocker has to fill 6 towers
                let lowestStructure: AnyStructure = damagedStructures[0];
                let lowestStructureHealth: number = lowestStructure.hits;
                for (let i = 0; i < damagedStructures.length; i++) {
                    if (damagedStructures[i].hits < lowestStructureHealth) {
                        lowestStructure = damagedStructures[i];
                        lowestStructureHealth = lowestStructure.hits;
                    }
                }

                for (let i = 0; i < towers.length; i++) {
                    if (this.repairIfEnoughEnergy(towers[i], lowestStructure, minimumEnergyToRepair) &&
                        otherCreeps.hostileCreeps.length === 0) {
                        //Only use 1 tower to repair, if there's no hostiles
                        break;
                    }
                }
            }
        }
    }

    private static repairIfEnoughEnergy(tower: StructureTower, structure: AnyStructure, minimumEnergyToRepair: number): boolean {
        if (tower.store.energy >= minimumEnergyToRepair) {
            tower.repair(structure);
            return true;
        }
        return false;
    }

    private static attackIfEnoughEnergy(tower: StructureTower, target: Creep): void {
        tower.attack(target);
    }

    private static getBestCreepTarget(hostileCreeps: Creep[]): Creep {
        if (hostileCreeps.length === 0) {
            return hostileCreeps[0];
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

        return target as Creep;
    }

    private static findOtherCreeps(room: Room): FindOtherCreepsResult {
        const result: FindOtherCreepsResult = {
            hostileCreeps: [],
            alliedCreeps: [],
            healers: false
        };
        const otherCreeps: Creep[] = room.find(FIND_HOSTILE_CREEPS);
        for (let i: number = 0; i < otherCreeps.length; i++) {
            const possibleHostileCreep: Creep = otherCreeps[i];
            if (EmpireHelper.isAllyUsername(possibleHostileCreep.owner.username)) {
                result.alliedCreeps.push(possibleHostileCreep);
            } else {
                result.hostileCreeps.push(possibleHostileCreep);
                if (!result.healers) {
                    for (let j = 0; j < possibleHostileCreep.body.length; j++) {
                        const bodyPart: BodyPartDefinition = possibleHostileCreep.body[j];
                        if (bodyPart.type === HEAL) {
                            result.healers = true;
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }
}
