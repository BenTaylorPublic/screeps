import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {EmpireHelper} from "../../global/helpers/empire-helper";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";

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
        this.handleRamparts(myRoom, room, otherCreeps);

        if (otherCreeps.hostileCreeps.length > 0 &&
            (room.controller as StructureController).safeMode == null &&
            (!otherCreeps.healers ||
                FlagHelper.getFlag1(["tower", "aggressive"], room.name) != null)) {
            const target: Creep = this.getBestCreepTarget(otherCreeps.hostileCreeps);
            if (target.owner.username !== "Invader") {
                //Only let me know if they're hostile
                if (CreepHelper.creepContainsBodyParts(target, [HEAL, CLAIM, ATTACK, RANGED_ATTACK])) {
                    ReportController.email("Tower attacking target with name " + target.name + " Owner: " + target.owner.username + " in " + LogHelper.roomNameAsLink(room.name),
                        ReportCooldownConstants.FIVE_MINUTE);
                }
            }

            //Fire them all
            for (let i = 0; i < towers.length; i++) {
                this.attackIfEnoughEnergy(towers[i], target);
            }
        } else {
            const oddThousand: boolean = Memory.myMemory.empire.oddThousand;
            const damagedStructures: AnyStructure[] = room.find(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    if (structure.hits === structure.hitsMax) {
                        return false;
                    }

                    if (structure.structureType === STRUCTURE_WALL) {
                        if (Constants.REPAIR_ONLY_ON_ODD_THOUSAND) {
                            if (!oddThousand &&
                                !otherCreeps.healers) {
                                return false;
                            } else {
                                return structure.hits < Constants.WALL_AND_RAMPART_GOAL_HEALTH;
                            }
                        } else {
                            return structure.hits < Constants.WALL_AND_RAMPART_GOAL_HEALTH;
                        }
                    } else if (structure.structureType === STRUCTURE_RAMPART) {

                        if (Constants.REPAIR_ONLY_ON_ODD_THOUSAND) {
                            if (structure.hits < 5_000 ||
                                otherCreeps.healers) {
                                return true;
                            } else if (oddThousand &&
                                structure.hits < Constants.WALL_AND_RAMPART_GOAL_HEALTH) {
                                return true;
                            }
                            return false;
                        } else {
                            return structure.hits < Constants.WALL_AND_RAMPART_GOAL_HEALTH;
                        }
                    } else {
                        //Normal structure
                        return !otherCreeps.healers;
                    }
                }
            });

            if (damagedStructures.length !== 0) {

                //Break once 1 tower has repaired
                //This stoped all 6 towers repairing once, so the stocker has to fill 6 towers
                let lowestStructure: AnyStructure = damagedStructures[0];
                let lowestStructureHealth: number = lowestStructure.hits;
                for (let i = 0; i < damagedStructures.length; i++) {
                    if (damagedStructures[i].hits < lowestStructureHealth ||
                        //If it's the same hits, prefer not walls
                        (damagedStructures[i].hits === lowestStructureHealth &&
                            damagedStructures[i].structureType !== STRUCTURE_WALL)) {
                        lowestStructure = damagedStructures[i];
                        lowestStructureHealth = lowestStructure.hits;
                    }
                }

                if (Constants.REPAIR_ONLY_ON_ODD_THOUSAND &&
                    otherCreeps.hostileCreeps.length === 0 &&
                    !oddThousand &&
                    //If the lowest structure is a rampart below 5K, repair regardless of oddThousand
                    (lowestStructure.structureType !== STRUCTURE_RAMPART ||
                        lowestStructure.hits > 5_000)) {
                    //Only repair when the odd thousand is true
                    return;
                }
                const minimumEnergyToRepair: number = (otherCreeps.hostileCreeps.length === 0) ? 500 : 10;

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

            if (!healer) {
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
                    if (CreepHelper.creepContainsBodyPart(possibleHostileCreep, HEAL)) {
                        result.healers = true;
                    }
                }
            }
        }
        return result;
    }

    private static handleRamparts(myRoom: MyRoom, room: Room, findOtherCreepsResult: FindOtherCreepsResult): void {
        if (!myRoom.rampartsUp) {
            if (findOtherCreepsResult.alliedCreeps.length === 0 ||
                findOtherCreepsResult.hostileCreeps.length > 0) {
                //Put ramparts up
                this.setRampartStatus(myRoom, room, true);
                ReportController.email("Putting ramparts UP in " + LogHelper.roomNameAsLink(myRoom.name));
            }
        } else if (findOtherCreepsResult.alliedCreeps.length > 0 &&
            findOtherCreepsResult.hostileCreeps.length === 0) {
            ReportController.email("Putting ramparts DOWN in " + LogHelper.roomNameAsLink(myRoom.name));
            this.setRampartStatus(myRoom, room, false);
        }
    }

    private static setRampartStatus(myRoom: MyRoom, room: Room, up: boolean): void {
        const ramparts: StructureRampart[] = room.find<StructureRampart>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_RAMPART;
            }
        });

        for (let i = 0; i < ramparts.length; i++) {
            ramparts[i].setPublic(!up);
        }

        myRoom.rampartsUp = up;
    }
}
