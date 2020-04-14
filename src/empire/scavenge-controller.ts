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
        this.startScavenge(flag.pos.roomName, amountOfResources, myMemory);
        flag.remove();
    }

    public static startScavenge(roomName: string, amountOfResources: number, myMemory: MyMemory): void {
        //All spawn logic in the one tick

        const myRooms: ScavengeMyRoom[] = [];
        for (let i = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            if (myRoom.roomStage < Constants.SCAVENGE_MIN_STAGE) {
                continue;
            }
            const roomDistance: number = MapHelper.getRoomDistance(roomName, myRoom.name);
            if (MapHelper.getRoomDistance(roomName, myRoom.name) > Constants.SCAVENGE_MAX_DISTANCE) {
                continue;
            }
            //Room is good
            const amountOfCarryPerCreep: number = Game.rooms[myRoom.name].energyCapacityAvailable / 100;
            const ttlForOneTrip: number = (roomDistance + 1) * 50 * 2;
            const amountOfTripsOneCreepCanDo: number = Math.floor(1500 / ttlForOneTrip);
            const repeatedCarryPerCreep: number = amountOfTripsOneCreepCanDo * amountOfCarryPerCreep;

            ReportController.log(LogHelper.roomNameAsLink(myRoom.name) + ": amountOfCarryPerCreep: " + amountOfCarryPerCreep);
            ReportController.log(LogHelper.roomNameAsLink(myRoom.name) + ": ttlForOneTrip: " + ttlForOneTrip);
            ReportController.log(LogHelper.roomNameAsLink(myRoom.name) + ": amountOfTripsOneCreepCanDo: " + amountOfTripsOneCreepCanDo);
            ReportController.log(LogHelper.roomNameAsLink(myRoom.name) + ": repeatedCarryPerCreep: " + repeatedCarryPerCreep);

            myRooms.push({
                amountOfCarryPerCreep: repeatedCarryPerCreep,
                myRoom: myRoom,
                scavengeAgainWhenTtlAbove: ttlForOneTrip
            });
        }

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

}