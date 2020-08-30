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

        const closestRoomNames: string[] = MapHelper.getClosestRooms(powerBank.pos, Constants.POWER_BANK_ROOM_STAGE);
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

        //WE'RE GOOD, LET'S GO BOIZ
        ReportController.log("Power scavenging power bank in room " + LogHelper.roomNameAsLink(powerBank.room.name));

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        for (let i: number = 0; i < closestRoomNames.length; i++) {
            roomsToSpawnThrough.push(closestRoomNames[i]);
        }

        //Working out how many creeps we'll need
        const damageTravelTime: number = closestDistance * powerBankTargets.averageDuoTravelTicksPerRoom;
        const damagePerTick: number = amountOfPositionsAroundBank * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
        const damageDonePerCreep: number = (1500 - damageTravelTime) * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
        const amountOfAttackCreepsNeeded: number = Math.ceil(2000000 / damageDonePerCreep);

        const email: string = "Scavenging power bank at " + powerBank.room.name + "\n" +
            "Game.time: " + Game.time + "\n" +
            "EOL: " + (Game.time + powerBank.ticksToDecay) + "\n" +
            "closestDistance: " + closestDistance + "\n" +
            "damageTravelTime: " + damageTravelTime + "\n" +
            "damagePerTick: " + damagePerTick + "\n" +
            "damageDonePerCreep: " + damageDonePerCreep + "\n" +
            "amountOfPositionsAroundBank: " + amountOfPositionsAroundBank + "\n" +
            "amountOfAttackCreepsNeeded: " + amountOfAttackCreepsNeeded;

        ReportController.email(email);

        powerBankTargets.targetBanks.push({
            id: powerBank.id,
            pos: RoomHelper.roomPosToMyPos(powerBank.pos),
            roomsToGetCreepsFrom: roomsToSpawnThrough,
            roomsToGetCreepsFromIndex: 0,
            eol: Game.time + powerBank.ticksToDecay,
            roomDistanceToBank: closestDistance,
            creeps: [],
            creepsDuosStillNeeded: amountOfAttackCreepsNeeded,
            amountOfPositionsAroundBank: amountOfPositionsAroundBank,
            power: powerBank.power
        });
    }

    public static run(powerBankTargets: PowerBankTargets): void {
        for (let i: number = powerBankTargets.targetBanks.length - 1; i >= 0; i--) {
            const powerBankTarget: PowerBankDetails = powerBankTargets.targetBanks[i];

            if (Game.time > powerBankTarget.eol) {
                //It gone
                powerBankTargets.targetBanks.splice(i, 1);
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
                Game.creeps[creepDuo.attack.name] == null) {
                creepDuo.attack = null;
            }
            if (creepDuo.heal != null &&
                Game.creeps[creepDuo.heal.name] == null) {
                creepDuo.heal = null;
            }
            if (creepDuo.heal == null && creepDuo.attack == null) {
                powerBankTarget.creeps.splice(i, 1);
            }
        }
        this.trySpawnCreepDuoIfNeeded(powerBankTarget, powerBankTargets);

        const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankTarget.id);

        for (let i: number = 0; i < powerBankTarget.creeps.length; i++) {
            this.runCreepDuo(powerBankTarget.creeps[i], powerBankTarget, powerBank, powerBankTargets);
        }
    }

    private static runCreepDuo(creepDuo: PowerBankCreepDuo, powerBankTarget: PowerBankDetails, powerBank: StructurePowerBank | null, powerBankTargets: PowerBankTargets): void {
        if (creepDuo.attack != null) {
            RolePowerBankAttackCreep.run(creepDuo.attack, powerBankTarget, powerBank);
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
            const newValue: number = 1500 - highestTtl;
            powerBankTargets.averageDuoTravelTicksPerRoom = ((powerBankTargets.averageDuoTravelTicksPerRoom * powerBankTargets.countDuoTravelTicksPerRoom) + newValue) / (powerBankTargets.countDuoTravelTicksPerRoom + 1);
            powerBankTargets.countDuoTravelTicksPerRoom += 1;
            creepDuo.averagesAdded = true;
        }
    }

    private static trySpawnCreepDuoIfNeeded(bank: PowerBankDetails, powerBankTargets: PowerBankTargets): void {

        if (bank.creepsDuosStillNeeded <= 0) {
            return;
        }

        let creepDuosToReplace: number = 0;
        let creepDuosStillGood: number = 0;
        let creepDuoToReplaceIndex: number = -1;
        for (let i: number = 0; i < bank.creeps.length; i++) {
            const creepDuo: PowerBankCreepDuo = bank.creeps[i];
            if (!bank.creeps[i].beenReplaced &&
                Game.time >= creepDuo.replaceAtTick) {
                creepDuosToReplace++;
                creepDuoToReplaceIndex = i;
            } else {
                //Still good
                creepDuosStillGood++;
            }
        }

        const shouldSpawnOne = (creepDuosStillGood < bank.amountOfPositionsAroundBank) || creepDuosToReplace > 0;
        if (!shouldSpawnOne) {
            return;
        }


        if (bank.roomsToGetCreepsFromIndex >= bank.roomsToGetCreepsFrom.length) {
            bank.roomsToGetCreepsFromIndex = 0;
        }
        bank.roomsToGetCreepsFromIndex++;
        const roomName: string = bank.roomsToGetCreepsFrom[bank.roomsToGetCreepsFromIndex];
        const myRoom: MyRoom | null = RoomHelper.getMyRoomByName(roomName);
        if (myRoom == null) {
            return;
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
        ReportController.log("Queued a new Power Bank Creep Duo in " + LogHelper.roomNameAsLink(myRoom.name));
        bank.creepsDuosStillNeeded--;

        if (creepDuoToReplaceIndex !== -1) {
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