import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";
import {RolePowerBankScavengeAttackCreep} from "./role/power-bank-scavenge-attack-creep";

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

        //Otherwise, WE'RE GOOD, LET'S GO BOIZ
        console.log("LOG: Power scavenging power bank in room " + powerBank.room.name);

        const amountOfRoomAroundBank: number = HelperFunctions.areaAroundPos(powerBank.pos, powerBank.room);

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        for (let i: number = 0; i < closestRooms.length; i++) {
            roomsToSpawnThrough.push(closestRooms[i].name);
        }

        //Working out how many creeps we'll need
        const travelTime: number = closestDistance * Constants.POWER_SCAVENGE_MAX_DAMAGE_TRAVEL_TICKS_PER_ROOM;
        const damageDonePerCreep: number = (1500 - travelTime) * amountOfRoomAroundBank * Constants.POWER_SCAVENGE_MAX_DAMAGE_PER_TICK_PER_AREA;
        const amountOfCreepsNeeded: number = Math.ceil(2000000 / damageDonePerCreep);

        myMemory.empire.powerScavenge.banksScavengingFrom.push({
            id: powerBank.id,
            pos: HelperFunctions.roomPosToMyPos(powerBank.pos),
            roomsToGetCreepsFrom: roomsToSpawnThrough,
            eol: Game.time + powerBank.ticksToDecay,
            roomDistanceToBank: closestDistance,
            attackCreeps: [],
            haulCreeps: [],
            attackCreepsStillNeeded: amountOfCreepsNeeded,
            amountOfRoomAmoundBank: amountOfRoomAroundBank,
            power: powerBank.power
        });
    }

    public static run(myMemory: MyMemory): void {
        if (myMemory.empire.powerScavenge.banksScavengingFrom.length === 0) {
            return;
        }
        for (let i: number = myMemory.empire.powerScavenge.banksScavengingFrom.length - 1; i >= 0; i--) {
            const bankScavengingFrom: PowerScavengeBank = myMemory.empire.powerScavenge.banksScavengingFrom[i];

            if (Game.time > bankScavengingFrom.eol) {
                //It gone
                myMemory.empire.powerScavenge.banksScavengingFrom.splice(i, 1);
            }
            this.handleBank(bankScavengingFrom, myMemory);
        }
    }

    private static handleBank(bankScavengingFrom: PowerScavengeBank, myMemory: MyMemory): void {
        this.trySpawnCreepsIfNeeded(bankScavengingFrom, myMemory);

        for (let i: number = bankScavengingFrom.attackCreeps.length - 1; i >= 0; i--) {
            if (!Game.creeps[bankScavengingFrom.attackCreeps[i].name]) {
                bankScavengingFrom.attackCreeps.splice(i, 1);
            } else {
                RolePowerBankScavengeAttackCreep.run(bankScavengingFrom.attackCreeps[i] as PowerBankScavengeAttackCreep);
            }
        }
    }

    private static trySpawnCreepsIfNeeded(bank: PowerScavengeBank, myMemory: MyMemory): void {

        if (bank.attackCreepsStillNeeded <= 0) {
            return;
        }
        for (let i: number = 0; i < bank.attackCreeps.length; i++) {

        }

        /*
        TODO:
        Need to replace creeps, and set .beenReplaced
        Need to spawn creeps to maintain the .amountOfRoomAmoundBank
         */

        const providedOnesThisTick: string[] = [];
        for (let i: number = bank.roomsToGetCreepsFrom.length - 1; i >= 0; i--) {
            const roomName: string = bank.roomsToGetCreepsFrom[i];
            if (providedOnesThisTick.includes(roomName)) {
                continue;
            }

            let myRoom: MyRoom | null = null;
            for (let j: number = 0; j < myMemory.myRooms.length; j++) {
                if (myMemory.myRooms[j].name === roomName) {
                    myRoom = myMemory.myRooms[j];
                    break;
                }
            }
            if (myRoom == null) {
                continue;
            }

            const newCreep: PowerBankScavengeAttackCreep | null = this.spawnCreep(bank, myRoom);
            if (newCreep != null) {
                bank.attackCreeps.push(newCreep);
                console.log("LOG: Spawned a new PowerBankScavengeAttackCreep");
                providedOnesThisTick.push(roomName);
                bank.attackCreepsStillNeeded--;
            }

        }
    }

    private static spawnCreep(powerScavengeBank: PowerScavengeBank, myRoom: MyRoom): PowerBankScavengeAttackCreep | null {

        let spawn: StructureSpawn | null;
        spawn = Game.spawns[myRoom.spawns[0].name];

        const body: BodyPartConstant[] =
            [
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                MOVE,
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