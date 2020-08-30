import {Constants} from "../global/constants/constants";
import {SpawnQueueController} from "../global/spawn-queue-controller";
import {SpawnConstants} from "../global/constants/spawn-constants";
import {ReportController} from "../reporting/report-controller";
import {MapHelper} from "../global/helpers/map-helper";
import {RoomHelper} from "../global/helpers/room-helper";
import {LogHelper} from "../global/helpers/log-helper";
import {CreepHelper} from "../global/helpers/creep-helper";
import {RolePowerBankAttackCreep} from "./role/power-bank-attack-creep";

export class PowerBankController {

    public static observedPowerBank(powerBank: StructurePowerBank): void {
        const myMemory: MyMemory = Memory.myMemory;
        if (powerBank.ticksToDecay < Constants.POWER_BANK_TTL_MIN) {
            //TTL not long enough
            return;
        }
        //Probably valid
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
            //Too far
            return;
        }

        for (let i: number = 0; i < myMemory.empire.powerBanks.targetBanks.length; i++) {
            const powerBankTarget = myMemory.empire.powerBanks.targetBanks[i];
            if (powerBankTarget.id === powerBank.id) {
                //Already setup
                return;
            }
        }

        if (myMemory.empire.powerBanks.targetBanks.length >= Constants.POWER_BANK_MAX_BANKS_AT_ONE_TIME) {
            return;
        }

        const amountOfPositionsAroundBank: number = RoomHelper.areaAroundPos(powerBank.pos, powerBank.room);
        if (amountOfPositionsAroundBank < Constants.POWER_BANK_AREA_AROUND_BANK_MIN) {
            return;
        }

        //Otherwise, WE'RE GOOD, LET'S GO BOIZ
        ReportController.log("Power scavenging power bank in room " + LogHelper.roomNameAsLink(powerBank.room.name));

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        for (let i: number = 0; i < closestRooms.length; i++) {
            roomsToSpawnThrough.push(closestRooms[i].name);
        }

        //Working out how many creeps we'll need
        const damageTravelTime: number = closestDistance * Constants.POWER_BANK_MAX_DAMAGE_TRAVEL_TICKS_PER_ROOM;
        const damagePerTick: number = amountOfPositionsAroundBank * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
        const damageDonePerCreep: number = (1500 - damageTravelTime) * Constants.POWER_BANK_MAX_DAMAGE_PER_TICK_PER_AREA;
        const amountOfAttackCreepsNeeded: number = Math.ceil(2000000 / damageDonePerCreep);

        const haulerTravelTime: number = closestDistance * Constants.POWER_BANK_MAX_HAUL_TRAVEL_TICKS_PER_ROOM;
        const spawnHaulersAtHp: number = haulerTravelTime * damagePerTick;

        const amountOfCarryBody: number = powerBank.power / 50;

        const email: string = "Scavenging power bank at " + powerBank.room.name + "\n" +
            "Game.time: " + Game.time + "\n" +
            "EOL: " + (Game.time + powerBank.ticksToDecay) + "\n" +
            "closestDistance: " + closestDistance + "\n" +
            "damageTravelTime: " + damageTravelTime + "\n" +
            "damagePerTick: " + damagePerTick + "\n" +
            "damageDonePerCreep: " + damageDonePerCreep + "\n" +
            "amountOfPositionsAroundBank: " + amountOfPositionsAroundBank + "\n" +
            "amountOfAttackCreepsNeeded: " + amountOfAttackCreepsNeeded + "\n" +
            "haulerTravelTime: " + haulerTravelTime + "\n" +
            "spawnHaulersAtHp: " + spawnHaulersAtHp + "\n" +
            "amountOfCarryBody: " + amountOfCarryBody + "\n";

        ReportController.email(email);

        myMemory.empire.powerBanks.targetBanks.push({
            id: powerBank.id,
            pos: RoomHelper.roomPosToMyPos(powerBank.pos),
            roomsToGetCreepsFrom: roomsToSpawnThrough,
            roomsToGetCreepsFromIndex: 0,
            eol: Game.time + powerBank.ticksToDecay,
            roomDistanceToBank: closestDistance,
            attackCreeps: [],
            attackCreepsStillNeeded: amountOfAttackCreepsNeeded,
            amountOfPositionsAroundBank: amountOfPositionsAroundBank,
            power: powerBank.power,
            replaceAtTTL: damageTravelTime,
            spawnHaulersAtHP: spawnHaulersAtHp,
            amountOfCarryBodyStillNeeded: amountOfCarryBody,
            state: "high_hp"
        });
    }

    public static run(myMemory: MyMemory): void {
        if (myMemory.empire.powerBanks.targetBanks.length === 0) {
            return;
        }
        for (let i: number = myMemory.empire.powerBanks.targetBanks.length - 1; i >= 0; i--) {
            const powerBankTarget: PowerBankDetails = myMemory.empire.powerBanks.targetBanks[i];

            if (Game.time > powerBankTarget.eol &&
                //Bank was killed by EOL, OR, I've spawned all the haulers I need
                (powerBankTarget.state !== "dead" ||
                    powerBankTarget.amountOfCarryBodyStillNeeded <= 0)) {
                //It gone
                myMemory.empire.powerBanks.targetBanks.splice(i, 1);
            }
            this.handleBank(powerBankTarget, myMemory);
        }
    }

    public static getHealBody(): BodyPartConstant[] {
        return [
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE,
            HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK,
            HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK,
            HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK,
            HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK
        ];
    }

    private static handleBank(powerBankTarget: PowerBankDetails, myMemory: MyMemory): void {
        for (let i: number = powerBankTarget.attackCreeps.length - 1; i >= 0; i--) {
            if (!Game.creeps[powerBankTarget.attackCreeps[i].name]) {
                powerBankTarget.attackCreeps.splice(i, 1);
            }
        }
        this.trySpawnAttackCreepIfNeeded(powerBankTarget, myMemory);

        const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(powerBankTarget.id);

        for (let i: number = 0; i < powerBankTarget.attackCreeps.length; i++) {
            RolePowerBankAttackCreep.run(powerBankTarget.attackCreeps[i] as PowerBankAttackCreep, powerBankTarget, powerBank);
        }

        if (powerBank != null &&
            powerBankTarget.state === "high_hp" &&
            powerBank.hits < powerBankTarget.spawnHaulersAtHP) {
            powerBankTarget.state = "spawn_haulers";
        }

        if (powerBankTarget.state === "high_hp") {
            return;
        }

        this.trySpawnHaulCreepIfNeeded(powerBankTarget, myMemory);

    }

    private static trySpawnHaulCreepIfNeeded(bank: PowerBankDetails, myMemory: MyMemory): void {
        //2 Carry per section
        const carryPerSection: number = 2;
        let sectionsNeeded = Math.ceil(bank.amountOfCarryBodyStillNeeded / carryPerSection);
        if (sectionsNeeded > 16) {
            sectionsNeeded = 16;
        } else if (sectionsNeeded <= 0) {
            return;
        }
        let body: BodyPartConstant[] = [];
        for (let i: number = 0; i < sectionsNeeded; i++) {
            body = body.concat([CARRY, CARRY, MOVE]);
        }

        if (bank.roomsToGetCreepsFromIndex >= bank.roomsToGetCreepsFrom.length) {
            bank.roomsToGetCreepsFromIndex = 0;
        }
        const roomName: string = bank.roomsToGetCreepsFrom[bank.roomsToGetCreepsFromIndex];
        bank.roomsToGetCreepsFromIndex++;
        const myRoom: MyRoom | null = RoomHelper.getMyRoomByName(roomName);
        if (myRoom == null) {
            return;
        }

        //OLD
        // const newCreep: PowerScavHaulCreep = this.spawnHaulCreep(bank, myRoom as MyRoom);
        // myMemory.empire.creeps.push(newCreep);
        ReportController.log("Queued a new PowerScavHaulCreep in " + LogHelper.roomNameAsLink(myRoom.name));
        bank.amountOfCarryBodyStillNeeded -= (sectionsNeeded * carryPerSection);
        if (bank.amountOfCarryBodyStillNeeded <= 0) {
            ReportController.email("PowerScav: Queued all the haul creeps needed in " + LogHelper.roomNameAsLink(myRoom.name));
        }

        return;

    }

    private static trySpawnAttackCreepIfNeeded(bank: PowerBankDetails, myMemory: MyMemory): void {

        if (bank.attackCreepsStillNeeded <= 0) {
            return;
        }

        let creepsToReplace: number = 0;
        let creepsStillGood: number = 0;
        for (let i: number = 0; i < bank.attackCreeps.length; i++) {
            const creep: Creep = Game.creeps[bank.attackCreeps[i].name] as Creep;
            if (!bank.attackCreeps[i].beenReplaced &&
                creep.ticksToLive != null &&
                creep.ticksToLive <= bank.replaceAtTTL) {
                creepsToReplace++;
            } else {
                //Still good
                creepsStillGood++;
            }
        }

        const shouldSpawnOne = (creepsStillGood < bank.amountOfPositionsAroundBank) || creepsToReplace > 0;
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

        const newCreep: PowerBankAttackCreep = this.spawnAttackCreep(bank, myRoom);
        bank.attackCreeps.push(newCreep);
        ReportController.log("Queued a new PowerScavAttackCreep in " + LogHelper.roomNameAsLink(myRoom.name));
        bank.attackCreepsStillNeeded--;
        for (let j: number = 0; j < bank.attackCreeps.length; j++) {
            if (bank.attackCreeps[j].beenReplaced) {
                continue;
            }
            const creep: Creep = Game.creeps[bank.attackCreeps[j].name] as Creep;
            if (creep.ticksToLive != null &&
                creep.ticksToLive <= bank.replaceAtTTL) {
                bank.attackCreeps[j].beenReplaced = true;
                return;
            }
        }
        return;

    }

    private static spawnAttackCreep(powerScav: PowerBankDetails, myRoom: MyRoom): PowerBankAttackCreep {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.POWER_BANK_ATTACK, name, "PowerBankAttackCreep");
        return {
            name: name,
            role: "PowerBankAttackCreep",
            assignedRoomName: powerScav.pos.roomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            powerBankId: powerScav.id,
            beenReplaced: false
        };
    }
}