import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {EmpireHelper} from "../../global/helpers/empire-helper";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";
import {RoomHelper} from "../../global/helpers/room-helper";

export class RoomTowerController {
    public static run(myRoom: MyRoom, room: Room): void {
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_TOWER,
                my: true
            }
        });

        const otherCreeps: FindOtherCreepsResult = this.findOtherCreeps(room);
        let threatLevel: number = 0;
        for (const hostileCreep of otherCreeps.hostileCreeps) {
            threatLevel += CreepHelper.creepThreatLevel(hostileCreep);
        }
        if (otherCreeps.hostileCreeps.length > 0 &&
            threatLevel >= Constants.TOWER_EMAIL_WHEN_THREAT_LEVEL_OVER) {
            const username: string = otherCreeps.hostileCreeps[0].owner.username;
            ReportController.email(`Threat level of ${threatLevel}, from ${username}, in ${LogHelper.roomNameAsLink(room.name)}`,
                ReportCooldownConstants.DAY);
        }

        this.handleRamparts(myRoom, room, otherCreeps);

        this.startDefenceIfNeeded(myRoom, room, threatLevel, otherCreeps);
        if (myRoom.defence != null) {
            this.defenceLogic(myRoom, room, towers, otherCreeps);
        } else {
            this.repairLogic(myRoom, room, towers);
        }
    }

    private static defenceLogic(myRoom: MyRoom, room: Room, towers: StructureTower[], otherCreeps: FindOtherCreepsResult): void {
        if (myRoom.defence != null) {
            let shouldSafemode: boolean = false;
            if (RoomHelper.amountOfStructure(room, STRUCTURE_WALL) < myRoom.defence.amountOfWalls) {
                ReportController.email(`MAYDAY ${LogHelper.roomNameAsLink(room.name)}: Wall was destroyed`, ReportCooldownConstants.DAY);
                shouldSafemode = true;
            }
            if (RoomHelper.amountOfStructure(room, STRUCTURE_RAMPART) < myRoom.defence.amountOfRamparts) {
                ReportController.email(`MAYDAY ${LogHelper.roomNameAsLink(room.name)}: Rampart was destroyed`, ReportCooldownConstants.DAY);
                shouldSafemode = true;
            }
            if (towers.length === 0) {
                ReportController.email(`MAYDAY ${LogHelper.roomNameAsLink(room.name)}: Threat with no towers`, ReportCooldownConstants.DAY);
                shouldSafemode = true;
            }
            if (otherCreeps.hostileCreeps.length === 0) {
                myRoom.defence = null;
            } else if (shouldSafemode) {
                if (room.controller == null ||
                    room.controller.safeModeAvailable === 0 ||
                    (room.controller.safeModeCooldown != null &&
                        room.controller.safeModeCooldown > 0)) {
                    ReportController.email(`MAYDAY ${LogHelper.roomNameAsLink(room.name)}: Can't safemode`);
                } else {
                    const safemodeResult: ScreepsReturnCode = room.controller.activateSafeMode();
                    if (safemodeResult === OK) {
                        ReportController.email(`MAYDAY ${LogHelper.roomNameAsLink(room.name)}: Activated safemode`);
                    } else {
                        ReportController.email(`MAYDAY ${LogHelper.roomNameAsLink(room.name)}: Failed to activate safemode. Result ${LogHelper.logScreepsReturnCode(safemodeResult)}`, ReportCooldownConstants.HOUR);
                    }
                }
            }
        }

        if (towers.length === 0) {
            return;
        }
        const defence: MyRoomDefence = myRoom.defence as MyRoomDefence;
        defence.ticks++;

        //Updates to defence strategy
        if (defence.strategy === "attack" || defence.strategy === "attack2") {
            //Re evaluate every 5 ticks
            if (defence.ticks % 10 === 0) {
                //Check if strategy works
                const totalDamageDone: number = this.calculateTotalDamageDone(otherCreeps.hostileCreeps);

                if (totalDamageDone <= defence.totalDamageDone) {
                    //Health hasn't gone down
                    //Strategy isn't working, try a different target
                    defence.creepTargetIndex++;
                    if (defence.creepTargetIndex >= otherCreeps.hostileCreeps.length) {
                        //Tried all the targets
                        if (defence.strategy === "attack") {
                            //Try all targets again
                            defence.strategy = "attack2";
                        } else {
                            //Swap to repairing
                            defence.strategy = "repair";
                        }
                        ReportController.log(`Changing defence strategy to ${defence.strategy}`);
                        defence.creepTargetIndex = 0;
                    }
                } //Else it's working
                defence.totalDamageDone = totalDamageDone;
            }
        }

        if (defence.strategy === "attack") {
            const target: Creep = otherCreeps.hostileCreeps[defence.creepTargetIndex] ?? otherCreeps.hostileCreeps[0];
            if (target.owner.username !== "Invader") {
                ReportController.log(`Tower attacking target ${target.name}, owner: ${target.owner.username} in ${LogHelper.roomNameAsLink(room.name)}`);
            }
            //Fire them all
            for (const tower of towers) {
                this.attackIfEnoughEnergy(tower, target);
            }
        } else if (defence.strategy === "repair") {
            const wallsAndRamparts: AnyStructure[] = room.find(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART;
                }
            });

            let lowestStructure: AnyStructure = wallsAndRamparts[0];
            let lowestStructureHealth: number = lowestStructure.hits;
            for (const item of wallsAndRamparts) {
                if (item.hits < lowestStructureHealth ||
                    //If it's the same hits, prefer not walls
                    (item.hits === lowestStructureHealth &&
                        item.structureType !== STRUCTURE_WALL)) {
                    lowestStructure = item;
                    lowestStructureHealth = lowestStructure.hits;
                }
            }
            for (const tower of towers) {
                this.repairIfEnoughEnergy(tower, lowestStructure, 10);
            }
        }
    }

    private static repairLogic(myRoom: MyRoom, room: Room, towers: StructureTower[]): void {
        if (towers.length === 0) {
            return;
        }
        const criticalStructures: AnyStructure[] = [];
        const damagedStructures: AnyStructure[] = [];
        const structures: AnyStructure[] = room.find(FIND_STRUCTURES);
        for (const structure of structures) {
            const hitsMax: number = (structure.structureType === STRUCTURE_WALL ||
                structure.structureType === STRUCTURE_RAMPART) ? Constants.WALL_AND_RAMPART_GOAL_HEALTH :
                structure.hitsMax;
            if (structure.hits >= hitsMax) {
                continue;
            }

            damagedStructures.push(structure);
            const healthPercentage: number = structure.hits / hitsMax;
            if (healthPercentage < Constants.STRUCTURES_CRITICAL_HEALTH_PERCENTAGE) {
                criticalStructures.push(structure);
            }
        }

        if (damagedStructures.length === 0) {
            return;
        }
        let structuresToRepair: AnyStructure[];
        if (criticalStructures.length > 0) {
            structuresToRepair = criticalStructures;
        } else {
            //No structures are critical
            //So first ensure that there are no construction sites or low energy spawns+extensions
            const constructionSitesExist: boolean = room.find(FIND_CONSTRUCTION_SITES).length > 0;
            if (constructionSitesExist) {
                return;
            }

            const roomHasUnhealthyEnergy: boolean = room.energyAvailable < room.energyCapacityAvailable;
            if (roomHasUnhealthyEnergy) {
                return;
            }
            structuresToRepair = damagedStructures;
        }

        let lowestStructure: AnyStructure = structuresToRepair[0];
        let lowestStructureHealth: number = lowestStructure.hits;
        for (const item of structuresToRepair) {
            if (item.hits < lowestStructureHealth ||
                //If it's the same hits, prefer not walls
                (item.hits === lowestStructureHealth &&
                    item.structureType !== STRUCTURE_WALL)) {
                lowestStructure = item;
                lowestStructureHealth = lowestStructure.hits;
            }
        }
        if (FlagHelper.getFlag1(["tower", "no", "repair"], room.name) != null) {
            return;
        }
        for (const tower of towers) {
            if (this.repairIfEnoughEnergy(tower, lowestStructure, 500)) {
                //Only use 1 tower to repair
                break;
            }
        }
    }

    private static startDefenceIfNeeded(myRoom: MyRoom, room: Room, threatLevel: number, otherCreeps: FindOtherCreepsResult): void {
        if (myRoom.defence == null &&
            threatLevel > 0) {
            //Probably 0, but just in case one comes in damaged
            const totalDamageDone: number = this.calculateTotalDamageDone(otherCreeps.hostileCreeps);
            myRoom.defence = {
                amountOfWalls: RoomHelper.amountOfStructure(room, STRUCTURE_WALL),
                amountOfRamparts: RoomHelper.amountOfStructure(room, STRUCTURE_RAMPART),
                ticks: 0,
                creepTargetIndex: 0,
                strategy: "attack",
                totalDamageDone: totalDamageDone,
            };
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

    private static findOtherCreeps(room: Room): FindOtherCreepsResult {
        const result: FindOtherCreepsResult = {
            hostileCreeps: [],
            alliedCreeps: [],
            healers: false
        };
        const otherCreeps: Creep[] = room.find(FIND_HOSTILE_CREEPS);
        for (const otherCreep of otherCreeps) {
            if (EmpireHelper.isAllyUsername(otherCreep.owner.username)) {
                result.alliedCreeps.push(otherCreep);
            } else {
                result.hostileCreeps.push(otherCreep);
                if (!result.healers &&
                    CreepHelper.creepContainsBodyPart(otherCreep, HEAL)) {
                    result.healers = true;
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

    private static calculateTotalDamageDone(creeps: Creep[]): number {
        let result: number = 0;
        for (const creep of creeps) {
            result += creep.hitsMax - creep.hits;
        }
        return result;
    }
}
