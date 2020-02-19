import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";

export class PowerScavengeController {
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

            if (bankScavengingFrom.round === "ROUND1" &&
                bankScavengingFrom.roundTwoStartTick <= Game.time &&
                bankScavengingFrom.roomsStillToProvideRound1.length === 0) {
                console.log("LOG Power scavenging power bank in room " + bankScavengingFrom.pos.roomName + "progressed to round 2");
                bankScavengingFrom.round = "ROUND2";
            }

            if (bankScavengingFrom.round === "ROUND1") {
                this.spawnCreepsIfNeeded(bankScavengingFrom.roomsStillToProvideRound1, bankScavengingFrom, myMemory);
            } else {
                this.spawnCreepsIfNeeded(bankScavengingFrom.roomsStillToProvideRound2, bankScavengingFrom, myMemory);
            }
        }
    }

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

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        let index: number = 0;
        for (let count: number = 0; count < Constants.POWER_SCAVENGE_DAMAGE_CREEP_COUNT; count++) {
            roomsToSpawnThrough.push(closestRooms[index].name);
            index++;
            if (index >= closestRooms.length) {
                index = 0;
            }
        }

        myMemory.empire.powerScavenge.banksScavengingFrom.push({
            id: powerBank.id,
            pos: HelperFunctions.roomPosToMyPos(powerBank.pos),
            roomsStillToProvideRound1: roomsToSpawnThrough,
            roomsStillToProvideRound2: roomsToSpawnThrough,
            round: "ROUND1",
            roundTwoStartTick: Game.time + Constants.POWER_SCAVENGE_START_ROUND_TWO_TICKS,
            eol: Game.time + powerBank.ticksToDecay
        });
    }

    private static spawnCreepsIfNeeded(roomsStillToProvide: string[], bank: PowerScavengeBank, myMemory: MyMemory): void {
        if (roomsStillToProvide.length === 0) {
            return;
        }
        for (let i: number = roomsStillToProvide.length - 1; i >= 0; i--) {
            const roomName: string = roomsStillToProvide[i];
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
                myMemory.empire.creeps.push(newCreep);
                console.log("LOG: Spawned a new PowerBankScavengeAttackCreep");
                roomsStillToProvide.splice(i, 1);
            }

        }
    }

    private static spawnCreep(powerScavengeBank: PowerScavengeBank, myRoom: MyRoom): PowerBankScavengeAttackCreep | null {

        let spawn: StructureSpawn | null;
        spawn = Game.spawns[myRoom.spawns[0].name];

        const body: BodyPartConstant[] =
            [HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK, MOVE,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK, MOVE,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK, MOVE,
                HEAL, HEAL, HEAL, HEAL, HEAL, ATTACK, ATTACK, ATTACK, ATTACK, MOVE,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];

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
                powerBankId: powerScavengeBank.id
            };
        }
        return null;
    }
}