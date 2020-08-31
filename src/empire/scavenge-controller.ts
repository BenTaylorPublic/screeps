import {Constants} from "../global/constants/constants";
import {MapHelper} from "../global/helpers/map-helper";
import {SpawnQueueController} from "../global/spawn-queue-controller";
import {CreepHelper} from "../global/helpers/creep-helper";
import {SpawnConstants} from "../global/constants/spawn-constants";
import {ReportController} from "../reporting/report-controller";
import {LogHelper} from "../global/helpers/log-helper";

export class ScavengeController {

    public static run(myMemory: MyMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            const flagName: string = flagNames[i];
            const flagNameSplit: string[] = flagName.split("-");
            if (flagNameSplit[0] !== "scavenge") {
                flagNames.splice(i, 1);
            }
        }

        if (flagNames.length !== 1) {
            return;
        }
        const flag: Flag = Game.flags[flagNames[0]];
        const amountOfResources: number = Number(flag.name.split("-")[1]);
        this.startScavenge(flag.pos.roomName, amountOfResources, myMemory, true);
        flag.remove();
    }

    public static generateTickQuoteForPowerBanks(roomName: string, amountOfResources: number): number {
        const myRooms: ScavengeMyRoom[] = this.generateRoomListForScavengerSpawning(roomName, amountOfResources, Memory.myMemory, false);
        if (myRooms.length === 0) {
            ReportController.email("ERROR: generateTickQuoteForPowerBanks gave 0 rooms");
            return -1;
        }
        const amountOfRoomsNeeded: number = Math.ceil(amountOfResources / 1250);
        const index: number = Math.min(myRooms.length - 1, amountOfRoomsNeeded - 1);
        const furtherestAwayRoom: ScavengeMyRoom = myRooms[index];
        const spawnTime: number = 50 * 3;
        return spawnTime + (furtherestAwayRoom.roomDistance * 50);
    }

    public static startScavenge(roomName: string, amountOfResources: number, myMemory: MyMemory, allowReturnTrips: boolean): void {
        //All spawn logic in the one tick

        const myRooms: ScavengeMyRoom[] = this.generateRoomListForScavengerSpawning(roomName, amountOfResources, myMemory, allowReturnTrips);

        if (myRooms.length === 0) {
            return;
        }

        const amountOfCarryPartsNeeded: number = Math.ceil(amountOfResources / 50);
        let amountOfCarryPartsQueued: number = 0;
        let amountOfCreepsSpawned: number = 0;
        let roomIndex: number = 0;
        let spawnedFromString: string = "";
        let loopedThroughOnce: boolean = false;
        do {
            const scavengeMyRoom: ScavengeMyRoom = myRooms[roomIndex];
            this.spawnScavengeCreep(scavengeMyRoom, roomName, myMemory);
            amountOfCarryPartsQueued += scavengeMyRoom.amountOfCarryPerCreep;
            amountOfCreepsSpawned++;
            roomIndex++;
            if (!loopedThroughOnce) {
                spawnedFromString += LogHelper.roomNameAsLink(scavengeMyRoom.myRoom.name) + " ";
            }
            if (roomIndex === myRooms.length) {
                roomIndex = 0;
                loopedThroughOnce = true;
            }
        } while (amountOfCarryPartsQueued < amountOfCarryPartsNeeded);
        ReportController.log("Scavenging: Spawned from rooms: " + spawnedFromString);
        ReportController.log("Scavenging: Spawned " + amountOfCreepsSpawned + " creeps across (up to) " + myRooms.length + " rooms for scavenging " + LogHelper.roomNameAsLink(roomName));
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return CreepHelper.generateBody([MOVE, CARRY],
            [MOVE, CARRY],
            Game.rooms[myRoom.name],
            true);
    }

    private static spawnScavengeCreep(scavengeMyRoom: ScavengeMyRoom, scavengingRoomName: string, myMemory: MyMemory): void {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(scavengeMyRoom.myRoom, SpawnConstants.SCAVENGER, name, "Scavenger");
        myMemory.empire.creeps.push({
            name: name,
            role: "Scavenger",
            assignedRoomName: scavengingRoomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            state: "Scavenging",
            scavengingRoomName: scavengingRoomName,
            scavengeAgainWhenTtlAbove: scavengeMyRoom.scavengeAgainWhenTtlAbove,
            scavengeTargetPos: null
        } as Scavenger);
    }

    private static generateRoomListForScavengerSpawning(roomName: string, amountOfResources: number, myMemory: MyMemory, allowReturnTrips: boolean): ScavengeMyRoom[] {
        const myRooms: ScavengeMyRoom[] = [];

        const closestBank: StructureStorage | null = MapHelper.findClosestBank(roomName, amountOfResources);
        if (closestBank == null) {
            ReportController.email("ERROR: closestBank is null while trying to scavenge");
            return [];
        }
        const distanceToBank: number = MapHelper.getRoomDistance(roomName, closestBank.room.name);

        for (let i = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            if (myRoom.roomStage < Constants.SCAVENGE_MIN_STAGE) {
                continue;
            }
            const spawnToScavengeRoom: number = MapHelper.getRoomDistance(roomName, myRoom.name);
            if (MapHelper.getRoomDistance(roomName, myRoom.name) > Constants.SCAVENGE_MAX_DISTANCE) {
                continue;
            }
            const ticksWastedGettingToScavengeRoom: number = 50 * spawnToScavengeRoom;
            const oneWayTripToBank: number = 50 * distanceToBank;
            const ttlAfterFirstTrip: number = (1500 - ticksWastedGettingToScavengeRoom - oneWayTripToBank);
            if (ttlAfterFirstTrip < 0) {
                //Wont even get to the room and then to a bank
                continue;
            }
            const amountOfTripsOneCreepCanDo: number = 1 + Math.floor(ttlAfterFirstTrip / (oneWayTripToBank * 2));

            let scavengeAgainWhenTtlAbove: number;
            let repeatedCarryPerCreep: number;
            if (allowReturnTrips) {
                scavengeAgainWhenTtlAbove = oneWayTripToBank * 2;
                repeatedCarryPerCreep = amountOfTripsOneCreepCanDo * Constants.SCAVENGE_CARRY_PER_CREEP;
            } else {
                //This will make it so they never scavenge again
                scavengeAgainWhenTtlAbove = 1500 + 1;
                repeatedCarryPerCreep = Constants.SCAVENGE_CARRY_PER_CREEP;
            }

            myRooms.push({
                amountOfCarryPerCreep: repeatedCarryPerCreep,
                myRoom: myRoom,
                scavengeAgainWhenTtlAbove: scavengeAgainWhenTtlAbove,
                roomDistance: spawnToScavengeRoom
            });
        }

        myRooms.sort((a: ScavengeMyRoom, b: ScavengeMyRoom) => {
            return a.roomDistance - b.roomDistance;
        });

        return myRooms;
    }

}