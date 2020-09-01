import {Constants} from "../global/constants/constants";
import {SpawnQueueController} from "../global/spawn-queue-controller";
import {SpawnConstants} from "../global/constants/spawn-constants";
import {ReportController} from "../reporting/report-controller";
import {MapHelper} from "../global/helpers/map-helper";
import {RoomHelper} from "../global/helpers/room-helper";
import {LogHelper} from "../global/helpers/log-helper";
import {CreepHelper} from "../global/helpers/creep-helper";
import {RolePowerBankAttackCreep} from "./role/power-bank-attack-creep";
import {RolePowerBankHealCreep} from "./role/power-bank-heal-creep";
import {ScavengeController} from "./scavenge-controller";

export class PowerBankController {

    public static observedPowerBank(powerBank: StructurePowerBank): void {
        const powerBankTargets: PowerBankTargets = Memory.myMemory.empire.powerBanks;

        if (powerBank.ticksToDecay < Constants.POWER_BANK_TTL_MIN) {
            //TTL not long enough
            return;
        }

        if (powerBankTargets.targetBanks.length >= Constants.POWER_BANK_MAX_BANKS_AT_ONE_TIME) {
            //Don't want to be targeting too many banks at a time
            return;
        }

        for (let i: number = 0; i < powerBankTargets.targetBanks.length; i++) {
            const powerBankTarget = powerBankTargets.targetBanks[i];
            if (powerBankTarget.id === powerBank.id) {
                //Already setup this bank
                return;
            }
        }

        const closestRoomNames: string[] = MapHelper.getClosestRooms(powerBank.pos, Constants.POWER_BANK_ROOM_STAGE, Constants.POWER_BANK_MIN_ENERGY);
        if (closestRoomNames.length === 0) {
            return;
        }

        const closestDistance: number = MapHelper.getRoomDistance(closestRoomNames[0], powerBank.pos.roomName);
        if (closestDistance > Constants.POWER_BANK_RANGE_MAX) {
            //Too far from any room
            return;
        }

        const amountOfPositionsAroundBank: number = RoomHelper.areaAroundPos(powerBank.pos, powerBank.room);
        if (amountOfPositionsAroundBank < Constants.POWER_BANK_AREA_AROUND_BANK_MIN) {
            return;
        }

        if (powerBank.power < Constants.POWER_BANK_MIN_POWER) {
            return;
        }

        const walls: StructureWall[] = powerBank.room.find<StructureWall>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_WALL;
                }
            }
        );
        if (walls.length > 0) {
            ReportController.email("Ignoring power bank in " + LogHelper.roomNameAsLink(powerBank.room.name) + " because it has walls");
            return;
        }

        //WE'RE GOOD, LET'S GO BOIZ
        ReportController.email("Power Bank Attack starting for room " + LogHelper.roomNameAsLink(powerBank.room.name));

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        for (let i: number = 0; i < closestRoomNames.length; i++) {
            roomsToSpawnThrough.push(closestRoomNames[i]);
        }

        //Working out how many creeps we'll need
        const damageTravelTime: number = closestDistance * powerBankTargets.averageDuoTravelTicksPerRoom;
        const damageDonePerCreep: number = (1500 - damageTravelTime) * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
        const creepsDuosStillNeeded: number = Math.ceil(2000000 / damageDonePerCreep);
        const scavengeTicksQuote: number = ScavengeController.generateTickQuoteForPowerBanks(powerBank.room.name, powerBank.power);

        powerBankTargets.targetBanks.push({
            id: powerBank.id,
            pos: RoomHelper.roomPosToMyPos(powerBank.pos),
            roomsToGetCreepsFrom: roomsToSpawnThrough,
            roomsToGetCreepsFromIndex: 0,
            eol: Game.time + powerBank.ticksToDecay,
            roomDistanceToBank: closestDistance,
            creeps: [],
            creepsDuosStillNeeded: creepsDuosStillNeeded,
            amountOfPositionsAroundBank: amountOfPositionsAroundBank,
            power: powerBank.power,
            queuedHaulers: false,
            scavengeTicksQuote: scavengeTicksQuote
        });
    }

    public static run(powerBankTargets: PowerBankTargets): void {
        for (let i: number = powerBankTargets.targetBanks.length - 1; i >= 0; i--) {
            const powerBankTarget: PowerBankDetails = powerBankTargets.targetBanks[i];

            if (Game.time > powerBankTarget.eol) {
                powerBankTargets.targetBanks.splice(i, 1);
                ReportController.email("BAD: Power Bank died from EOL in " + LogHelper.roomNameAsLink(powerBankTarget.pos.roomName));
            } else if (powerBankTarget.creepsDuosStillNeeded === 0 &&
                powerBankTarget.creeps.length === 0) {
                powerBankTargets.targetBanks.splice(i, 1);
                const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankTarget.id);
                if (powerBank == null) {
                    ReportController.email("Power Bank killed in " + LogHelper.roomNameAsLink(powerBankTarget.pos.roomName));
                } else {
                    ReportController.email("BAD: Power Bank attack failed, all creeps dead, bank alive in " + LogHelper.roomNameAsLink(powerBankTarget.pos.roomName));
                }
            } else {
                this.handleBank(powerBankTarget, powerBankTargets);
            }
        }
    }

    public static getAttackerBody(): BodyPartConstant[] {
        return [
            //14 move
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE,
            //28 attack
            ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
            ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
            ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK
        ];
    }

    public static getHealerBody(): BodyPartConstant[] {
        return [
            //12 move
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE,
            //35 heal
            HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
            HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
            HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
            HEAL, HEAL, HEAL, HEAL, HEAL
        ];
    }

    private static handleBank(powerBankTarget: PowerBankDetails, powerBankTargets: PowerBankTargets): void {
        //Need to do our own memory management here, for dying creeps
        for (let i: number = powerBankTarget.creeps.length - 1; i >= 0; i--) {
            const creepDuo: PowerBankCreepDuo = powerBankTarget.creeps[i];
            if (creepDuo.attack != null &&
                creepDuo.attack.spawningStatus === "alive" &&
                Game.creeps[creepDuo.attack.name] == null) {
                creepDuo.attack = null;
            }
            if (creepDuo.heal != null &&
                creepDuo.heal.spawningStatus === "alive" &&
                Game.creeps[creepDuo.heal.name] == null) {
                creepDuo.heal = null;
            }
            if (creepDuo.heal == null && creepDuo.attack == null) {
                ReportController.log("Power Bank duo died for bank " + LogHelper.roomNameAsLink(powerBankTarget.pos.roomName));
                powerBankTarget.creeps.splice(i, 1);
            }
        }
        this.trySpawnCreepDuoIfNeeded(powerBankTarget, powerBankTargets);

        const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankTarget.id);

        if (powerBank != null &&
            !powerBankTarget.queuedHaulers &&
            Game.time % 10 === 0) {
            //There's potential...
            const damagePerTick: number = powerBankTarget.creeps.length * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
            const amountOfTicksLeftInaccurate: number = powerBank.hits / damagePerTick;
            if (amountOfTicksLeftInaccurate < powerBankTarget.scavengeTicksQuote) {
                //High potential
                //Lets get an accurate number...
                let damageInQuoteTime: number = 0;
                for (let i: number = 0; i < powerBankTarget.creeps.length; i++) {
                    const creepDuo: PowerBankCreepDuo = powerBankTarget.creeps[i];
                    //Averages added means they're there and actively damaging
                    if (creepDuo.averagesAdded) {
                        let maxDamageTicks: number;
                        if (creepDuo.heal == null) {
                            maxDamageTicks = 0;
                        } else if (creepDuo.attack == null) {
                            maxDamageTicks = 0;
                        } else {
                            maxDamageTicks = Math.min(powerBankTarget.scavengeTicksQuote,
                                Game.creeps[creepDuo.attack.name].ticksToLive as number,
                                Game.creeps[creepDuo.heal.name].ticksToLive as number);
                        }
                        damageInQuoteTime += maxDamageTicks * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
                    }
                }

                if (damageInQuoteTime > powerBank.hits) {
                    //We should queue
                    powerBankTarget.queuedHaulers = true;
                    ReportController.email("Starting haulers for a power bank in " + LogHelper.roomNameAsLink(powerBankTarget.pos.roomName));
                    ScavengeController.startScavenge(powerBank.room.name, powerBankTarget.power, Memory.myMemory, false);
                }
            }
        }


        for (let i: number = 0; i < powerBankTarget.creeps.length; i++) {
            this.runCreepDuo(powerBankTarget.creeps[i], powerBankTarget, powerBank, powerBankTargets);
        }
    }

    private static runCreepDuo(creepDuo: PowerBankCreepDuo, powerBankTarget: PowerBankDetails, powerBank: StructurePowerBank | null, powerBankTargets: PowerBankTargets): void {
        if (creepDuo.attack != null) {
            RolePowerBankAttackCreep.run(creepDuo.attack, powerBankTarget, powerBank, creepDuo.heal);
        }
        if (creepDuo.heal != null) {
            RolePowerBankHealCreep.run(creepDuo.heal, powerBankTarget, powerBank, creepDuo.attack);
        }

        if (!creepDuo.averagesAdded &&
            creepDuo.attack != null &&
            creepDuo.attack.reachedPowerBank &&
            creepDuo.heal != null &&
            creepDuo.heal.reachedPowerBank) {
            //Add the average
            //NewAverage = ((oldAverage * oldCount) + newValue) / newCount
            const highestTtl: number = Math.max(Game.creeps[creepDuo.attack.name].ticksToLive as number, Game.creeps[creepDuo.heal.name].ticksToLive as number);
            const newValue: number = (1500 - highestTtl) / powerBankTarget.roomDistanceToBank;
            powerBankTargets.averageDuoTravelTicksPerRoom = ((powerBankTargets.averageDuoTravelTicksPerRoom * powerBankTargets.countDuoTravelTicksPerRoom) + newValue) / (powerBankTargets.countDuoTravelTicksPerRoom + 1);
            powerBankTargets.countDuoTravelTicksPerRoom += 1;
            creepDuo.averagesAdded = true;
        }
    }

    private static trySpawnCreepDuoIfNeeded(bank: PowerBankDetails, powerBankTargets: PowerBankTargets): void {

        if (bank.creepsDuosStillNeeded <= 0) {
            return;
        }

        let creepDuosStillGood: number = 0;
        let creepDuoToReplaceIndex: number = -1;
        for (let i: number = 0; i < bank.creeps.length; i++) {
            const creepDuo: PowerBankCreepDuo = bank.creeps[i];
            if (!bank.creeps[i].beenReplaced &&
                Game.time >= creepDuo.replaceAtTick) {
                creepDuoToReplaceIndex = i;
                break;
            } else {
                //Still good
                creepDuosStillGood++;
            }
        }

        const shouldSpawnOne = (creepDuosStillGood < bank.amountOfPositionsAroundBank) || creepDuoToReplaceIndex >= 0;
        if (!shouldSpawnOne) {
            return;
        }


        bank.roomsToGetCreepsFromIndex++;
        if (bank.roomsToGetCreepsFromIndex >= bank.roomsToGetCreepsFrom.length) {
            bank.roomsToGetCreepsFromIndex = 0;
        }
        const roomName: string = bank.roomsToGetCreepsFrom[bank.roomsToGetCreepsFromIndex];
        const myRoom: MyRoom | null = RoomHelper.getMyRoomByName(roomName);
        if (myRoom == null) {
            return;
        }

        for (let i: number = 0; myRoom.spawnQueue.length; i++) {
            const queuedCreep: QueuedCreep = myRoom.spawnQueue[i];
            if (queuedCreep.role === "PowerBankAttackCreep" ||
                queuedCreep.role === "PowerBankHealCreep") {
                //Not going to add a duo to the spawn queue, as there's already one in it
                bank.roomsToGetCreepsFromIndex--;
                return;
            }
        }

        const newHealCreep: PowerBankAttackCreep = this.spawnHealCreep(bank, myRoom);
        const newAttackCreep: PowerBankAttackCreep = this.spawnAttackCreep(bank, myRoom);

        const maxTravelTime: number = powerBankTargets.averageDuoTravelTicksPerRoom * bank.roomDistanceToBank;
        const replaceAtTick: number = Game.time + 1500 - maxTravelTime - Constants.POWER_BANK_DUO_TICKS_TO_SPAWN;

        const newCreepDuo: PowerBankCreepDuo = {
            attack: newAttackCreep,
            heal: newHealCreep,
            beenReplaced: false,
            replaceAtTick: replaceAtTick,
            averagesAdded: false
        };
        bank.creeps.push(newCreepDuo);
        ReportController.log("Queued a new Power Bank Creep Duo in " + LogHelper.roomNameAsLink(myRoom.name) + " for power bank in " + LogHelper.roomNameAsLink(bank.pos.roomName));
        bank.creepsDuosStillNeeded--;

        if (creepDuoToReplaceIndex !== -1) {
            ReportController.log("Duo just queued was a replacement team");
            bank.creeps[creepDuoToReplaceIndex].beenReplaced = true;
        }
    }

    private static spawnAttackCreep(powerBankDetails: PowerBankDetails, myRoom: MyRoom): PowerBankAttackCreep {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.POWER_BANK_ATTACK, name, "PowerBankAttackCreep");
        return {
            name: name,
            role: "PowerBankAttackCreep",
            assignedRoomName: powerBankDetails.pos.roomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            reachedPowerBank: false
        };
    }

    private static spawnHealCreep(powerBankDetails: PowerBankDetails, myRoom: MyRoom): PowerBankHealCreep {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.POWER_BANK_HEAL, name, "PowerBankHealCreep");
        return {
            name: name,
            role: "PowerBankHealCreep",
            assignedRoomName: powerBankDetails.pos.roomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            reachedPowerBank: false
        };
    }
}