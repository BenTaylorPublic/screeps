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
        const myMemory: MyMemory = Memory.myMemory;

        if (powerBank.ticksToDecay < Constants.POWER_BANK_TTL_MIN) {
            //TTL not long enough
            return;
        }

        if (myMemory.empire.powerBanks.targetBanks.length >= Constants.POWER_BANK_MAX_BANKS_AT_ONE_TIME) {
            //Don't want to be targeting too many banks at a time
            return;
        }

        for (let i: number = 0; i < myMemory.empire.powerBanks.targetBanks.length; i++) {
            const powerBankTarget = myMemory.empire.powerBanks.targetBanks[i];
            if (powerBankTarget.id === powerBank.id) {
                //Already setup this bank
                return;
            }
        }

        let closestDistance: number = 999;
        let closestRooms: MyRoom[] = [];
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            if (myRoom.roomStage < Constants.POWER_BANK_ROOM_STAGE) {
                continue;
            }
            const roomDistance = MapHelper.getRoomDistance(powerBank.room.name, myRoom.name);
            if (roomDistance === closestDistance) {
                closestRooms.push(myRoom);
            } else if (roomDistance < closestDistance) {
                closestRooms = [myRoom];
                closestDistance = roomDistance;
            }
        }

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
        for (let i: number = 0; i < closestRooms.length; i++) {
            roomsToSpawnThrough.push(closestRooms[i].name);
        }

        //Working out how many creeps we'll need
        const damageTravelTime: number = closestDistance * myMemory.empire.powerBanks.averageAttackTravelPerRoom;
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

        myMemory.empire.powerBanks.targetBanks.push({
            id: powerBank.id,
            pos: RoomHelper.roomPosToMyPos(powerBank.pos),
            roomsToGetCreepsFrom: roomsToSpawnThrough,
            roomsToGetCreepsFromIndex: 0,
            eol: Game.time + powerBank.ticksToDecay,
            roomDistanceToBank: closestDistance,
            creeps: [],
            creepsDuosStillNeeded: amountOfAttackCreepsNeeded,
            amountOfPositionsAroundBank: amountOfPositionsAroundBank,
            power: powerBank.power,
            replaceAtTTL: damageTravelTime
        });
    }

    public static run(myMemory: MyMemory): void {
        for (let i: number = myMemory.empire.powerBanks.targetBanks.length - 1; i >= 0; i--) {
            const powerBankTarget: PowerBankDetails = myMemory.empire.powerBanks.targetBanks[i];

            if (Game.time > powerBankTarget.eol) {
                //It gone
                myMemory.empire.powerBanks.targetBanks.splice(i, 1);
            } else {
                this.handleBank(powerBankTarget, myMemory);
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

    private static handleBank(powerBankTarget: PowerBankDetails, myMemory: MyMemory): void {
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
        this.trySpawnCreepDuoIfNeeded(powerBankTarget, myMemory);

        const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankTarget.id);

        for (let i: number = 0; i < powerBankTarget.creeps.length; i++) {
            const creepDuo: PowerBankCreepDuo = powerBankTarget.creeps[i];
            if (creepDuo.attack != null) {
                RolePowerBankAttackCreep.run(creepDuo.attack, powerBankTarget, powerBank);
            }
            if (creepDuo.heal != null) {
                RolePowerBankHealCreep.run(creepDuo.heal, powerBankTarget, powerBank);
            }
        }
    }

    private static trySpawnCreepDuoIfNeeded(bank: PowerBankDetails, myMemory: MyMemory): void {

        if (bank.creepsDuosStillNeeded <= 0) {
            return;
        }

        let creepDuosToReplace: number = 0;
        let creepDuosStilGood: number = 0;
        let creepDuoToReplaceIndex: number = -1;
        for (let i: number = 0; i < bank.creeps.length; i++) {
            const creepDuo: PowerBankCreepDuo = bank.creeps[i];
            if (!bank.creeps[i].beenReplaced &&
                Game.time >= creepDuo.replaceAtTick) {
                creepDuosToReplace++;
                creepDuoToReplaceIndex = i;
            } else {
                //Still good
                creepDuosStilGood++;
            }
        }

        const shouldSpawnOne = (creepDuosStilGood < bank.amountOfPositionsAroundBank) || creepDuosToReplace > 0;
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

        let maxTravelTime: number;
        if (myMemory.empire.powerBanks.averageAttackTravelPerRoom > myMemory.empire.powerBanks.averageHealTravelPerRoom) {
            maxTravelTime = myMemory.empire.powerBanks.averageAttackTravelPerRoom * bank.roomDistanceToBank;
        } else {
            maxTravelTime = myMemory.empire.powerBanks.averageHealTravelPerRoom * bank.roomDistanceToBank;
        }
        const replaceAtTick: number = Game.time + 1500 - maxTravelTime - Constants.POWER_BANK_DUO_TICKS_TO_SPAWN;

        const newCreepDuo: PowerBankCreepDuo = {
            attack: newAttackCreep,
            heal: newHealCreep,
            beenReplaced: false,
            replaceAtTick: replaceAtTick
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
            }
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
            }
        };
    }
}