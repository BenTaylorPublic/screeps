import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";
import {RolePowerBankScavengeAttackCreep} from "./role/power-bank-scavenge-attack-creep";
import {Memory} from "../global/memory";

export class PowerScavengeController {

    public static observedPowerBank(powerBank: StructurePowerBank): void {
        const myMemory: MyMemory = Memory.myMemory;
        if (powerBank.ticksToDecay < Constants.POWER_SCAVENGE_TTL_MIN) {
            //TTL not long enough
            return;
        }
        //Probably valid
        let closestDistance: number = 999;
        let closestRooms: MyRoom[] = [];
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            if (myRoom.roomStage < Constants.POWER_SCAVENGE_ROOM_STAGE) {
                continue;
            }
            const roomDistance = HelperFunctions.getRoomDistance(powerBank.room.name, myRoom.name);
            if (roomDistance === closestDistance) {
                closestRooms.push(myRoom);
            } else if (roomDistance < closestDistance) {
                closestRooms = [myRoom];
                closestDistance = roomDistance;
            }
        }

        if (closestDistance > Constants.POWER_SCAVENGE_RANGE_MAX) {
            //Too far
            return;
        }

        for (let i: number = 0; i < myMemory.empire.powerScavenge.banksScavengingFrom.length; i++) {
            const bankScavengingFrom = myMemory.empire.powerScavenge.banksScavengingFrom[i];
            if (bankScavengingFrom.id === powerBank.id) {
                //Already setup
                return;
            }
        }

        if (myMemory.empire.powerScavenge.banksScavengingFrom.length >= Constants.POWER_SCAVENGE_MAX_BANKS_AT_ONE_TIME) {
            return;
        }

        const amountOfPositionsAroundBank: number = HelperFunctions.areaAroundPos(powerBank.pos, powerBank.room);
        if (amountOfPositionsAroundBank < Constants.POWER_SCAVENGE_AREA_AROUND_BANK_MIN) {
            return;
        }

        //Otherwise, WE'RE GOOD, LET'S GO BOIZ
        console.log("LOG: Power scavenging power bank in room " + powerBank.room.name);

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        for (let i: number = 0; i < closestRooms.length; i++) {
            roomsToSpawnThrough.push(closestRooms[i].name);
        }

        //Working out how many creeps we'll need
        const damageTravelTime: number = closestDistance * Constants.POWER_SCAVENGE_MAX_DAMAGE_TRAVEL_TICKS_PER_ROOM;
        const damagePerTick: number = amountOfPositionsAroundBank * Constants.POWER_SCAVENGE_MAX_DAMAGE_PER_TICK_PER_AREA;
        const damageDonePerCreep: number = (1500 - damageTravelTime) * Constants.POWER_SCAVENGE_MAX_DAMAGE_PER_TICK_PER_AREA;
        const amountOfAttackCreepsNeeded: number = Math.ceil(2000000 / damageDonePerCreep);

        const haulerTravelTime: number = closestDistance * Constants.POWER_SCAVENGE_MAX_HAUL_TRAVEL_TICKS_PER_ROOM;
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

        Game.notify(email);

        myMemory.empire.powerScavenge.banksScavengingFrom.push({
            id: powerBank.id,
            pos: HelperFunctions.roomPosToMyPos(powerBank.pos),
            roomsToGetCreepsFrom: roomsToSpawnThrough,
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
        if (myMemory.empire.powerScavenge.banksScavengingFrom.length === 0) {
            return;
        }
        for (let i: number = myMemory.empire.powerScavenge.banksScavengingFrom.length - 1; i >= 0; i--) {
            const bankScavengingFrom: PowerScavengeBank = myMemory.empire.powerScavenge.banksScavengingFrom[i];

            if (Game.time > bankScavengingFrom.eol &&
                //Bank was killed by EOL, OR, I've spawned all the haulers I need
                (bankScavengingFrom.state !== "dead" ||
                    bankScavengingFrom.amountOfCarryBodyStillNeeded <= 0)) {
                //It gone
                myMemory.empire.powerScavenge.banksScavengingFrom.splice(i, 1);
            }
            this.handleBank(bankScavengingFrom, myMemory);
        }
    }

    private static handleBank(bankScavengingFrom: PowerScavengeBank, myMemory: MyMemory): void {
        for (let i: number = bankScavengingFrom.attackCreeps.length - 1; i >= 0; i--) {
            if (!Game.creeps[bankScavengingFrom.attackCreeps[i].name]) {
                bankScavengingFrom.attackCreeps.splice(i, 1);
            }
        }
        this.trySpawnAttackCreepIfNeeded(bankScavengingFrom, myMemory);

        const powerBank: StructurePowerBank | null = Game.getObjectById<StructurePowerBank>(bankScavengingFrom.id);

        for (let i: number = 0; i < bankScavengingFrom.attackCreeps.length; i++) {
            RolePowerBankScavengeAttackCreep.run(bankScavengingFrom.attackCreeps[i] as PowerBankScavengeAttackCreep, bankScavengingFrom, powerBank);
        }

        if (powerBank != null &&
            bankScavengingFrom.state === "high_hp" &&
            powerBank.hits < bankScavengingFrom.spawnHaulersAtHP) {
            bankScavengingFrom.state = "spawn_haulers";
        }

        if (bankScavengingFrom.state === "high_hp") {
            return;
        }

        this.trySpawnHaulCreepIfNeeded(bankScavengingFrom, myMemory);

    }

    private static trySpawnHaulCreepIfNeeded(bank: PowerScavengeBank, myMemory: MyMemory): void {

        //2 Carry per section
        const carryPerSection: number = 2;
        let sectionsNeeded = Math.ceil(bank.amountOfCarryBodyStillNeeded / carryPerSection);
        if (sectionsNeeded > 16) {
            sectionsNeeded = 16;
        } else if (sectionsNeeded <= 0) {
            return;
        }
        const body: BodyPartConstant[] = [];
        for (let i: number = 0; i < sectionsNeeded; i++) {
            body.concat([CARRY, CARRY, MOVE]);
        }


        for (let i: number = bank.roomsToGetCreepsFrom.length - 1; i >= 0; i--) {
            const roomName: string = bank.roomsToGetCreepsFrom[i];
            const myRoom: MyRoom | null = HelperFunctions.getMyRoomByName(roomName);
            if (myRoom == null) {
                continue;
            }

            const newCreep: PowerBankScavengeHaulCreep | null = this.spawnHaulCreep(bank, myRoom, body);
            if (newCreep != null) {
                myMemory.empire.creeps.push(newCreep);
                console.log("LOG: Spawned a new PowerBankScavengeHaulCreep");
                bank.amountOfCarryBodyStillNeeded -= (sectionsNeeded * carryPerSection);
                if (bank.amountOfCarryBodyStillNeeded <= 0) {
                    Game.notify("PowerScavenge: Spawned all the haul creeps needed");
                }

                return;
            }
        }

    }

    private static spawnHaulCreep(powerScavengeBank: PowerScavengeBank, myRoom: MyRoom, body: BodyPartConstant[]): PowerBankScavengeHaulCreep | null {

        let spawn: StructureSpawn | null;
        spawn = Game.spawns[myRoom.spawns[0].name];

        const id = HelperFunctions.getId();
        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                body,
                "Creep" + id,
                {
                    memory:
                        {
                            name: "Creep" + id,
                            role: "PowerBankScavengeHaulCreep",
                            assignedRoomName: powerScavengeBank.pos.roomName
                        }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "PowerBankScavengeHaulCreep",
                assignedRoomName: powerScavengeBank.pos.roomName,
                state: "grabbing",
                roomToDepositTo: myRoom.name
            };
        }
        return null;
    }

    private static trySpawnAttackCreepIfNeeded(bank: PowerScavengeBank, myMemory: MyMemory): void {

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

        for (let i: number = bank.roomsToGetCreepsFrom.length - 1; i >= 0; i--) {
            const roomName: string = bank.roomsToGetCreepsFrom[i];
            const myRoom: MyRoom | null = HelperFunctions.getMyRoomByName(roomName);
            if (myRoom == null) {
                continue;
            }

            const newCreep: PowerBankScavengeAttackCreep | null = this.spawnAttackCreep(bank, myRoom);
            if (newCreep != null) {
                bank.attackCreeps.push(newCreep);
                console.log("LOG: Spawned a new PowerBankScavengeAttackCreep");
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
        }
    }

    private static spawnAttackCreep(powerScavengeBank: PowerScavengeBank, myRoom: MyRoom): PowerBankScavengeAttackCreep | null {

        let spawn: StructureSpawn | null;
        spawn = Game.spawns[myRoom.spawns[0].name];

        const body: BodyPartConstant[] =
            [
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                MOVE, MOVE,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK
            ];

        const id = HelperFunctions.getId();
        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                body,
                "Creep" + id,
                {
                    memory:
                        {
                            name: "Creep" + id,
                            role: "PowerBankScavengeAttackCreep",
                            assignedRoomName: powerScavengeBank.pos.roomName
                        }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "PowerBankScavengeAttackCreep",
                assignedRoomName: powerScavengeBank.pos.roomName,
                powerBankId: powerScavengeBank.id,
                beenReplaced: false
            };
        }
        return null;
    }
}