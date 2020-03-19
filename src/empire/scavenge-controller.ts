import {Constants} from "../global/constants";
import {MapHelper} from "../global/helpers/map-helper";
import {SpawnQueueController} from "../global/spawn-queue-controller";
import {CreepHelper} from "../global/helpers/creep-helper";
import {SpawnConstants} from "../global/spawn-constants";
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
            if (MapHelper.getRoomDistance(roomName, myRoom.name) > Constants.SCAVENGE_MAX_DISTANCE) {
                continue;
            }
            //Room is good
            const amountOfCarryPerCreep: number = Game.rooms[myRoom.name].energyCapacityAvailable / 100;
            myRooms.push({
                amountOfCarryPerCreep: amountOfCarryPerCreep,
                myRoom: myRoom
            });
        }

        if (myRooms.length === 0) {
            return;
        }

        const amountOfCarryPartsNeeded: number = amountOfResources / 50;
        let amountOfCarryPartsQueued: number = 0;
        let amountOfCreepsSpawned: number = 0;
        let roomIndex: number = 0;
        do {
            const scavengeMyRoom: ScavengeMyRoom = myRooms[roomIndex];
            this.spawnScavengeCreep(scavengeMyRoom.myRoom, roomName, myMemory);
            amountOfCarryPartsQueued += scavengeMyRoom.amountOfCarryPerCreep;
            amountOfCreepsSpawned++;
            roomIndex++;
            if (roomIndex === myRooms.length) {
                roomIndex = 0;
            }
        } while (amountOfCarryPartsQueued < amountOfCarryPartsNeeded);

        ReportController.log("Spawned " + amountOfCreepsSpawned + " creeps across " + myRooms.length + " rooms for scavenging " + LogHelper.roomNameAsLink(roomName));
    }

    private static spawnScavengeCreep(myRoom: MyRoom, scavengingRoomName: string, myMemory: MyMemory): void {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.SCAVENGER, name, "Scavenger");
        myMemory.empire.creeps.push({
            name: name,
            role: "Scavenger",
            assignedRoomName: scavengingRoomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            state: "Scavenging"
        } as Scavenger);
    }

}