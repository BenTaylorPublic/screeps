import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MapHelper} from "../../global/helpers/map-helper";

export class SignController {
    private static message: string = "X";

    public static run(myMemory: MyMemory): void {
        if (Game.time % 100 !== 0) {
            return;
        }
        const flag: Flag | null = Game.flags["sign"];
        if (flag != null) {
            this.sign(flag, myMemory);
            return;
        }

        const flagAll: Flag | null = Game.flags["sign-all"];
        if (flagAll != null) {
            this.signAll(flagAll, myMemory);
        }

    }

    public static runCreep(signer: Signer): void {
        const creep: Creep = Game.creeps[signer.name];
        if (CreepHelper.handleCreepPreRole(signer)) {
            return;
        }
        if (creep.room.controller == null) {
            ReportController.email("ERROR: Signer can't sign a room with no controller in " + LogHelper.roomNameAsLink(creep.room.name));
            return;
        }
        const signResult = creep.signController(creep.room.controller, signer.signWords);
        if (signResult === ERR_NOT_IN_RANGE) {
            MovementHelper.myMoveTo(creep, creep.room.controller.pos, signer);
        } else if (signResult === OK) {
            ReportController.log("Successfully signed " + LogHelper.roomNameAsLink(signer.assignedRoomName));
            creep.say("dthb4dshnr");
            creep.suicide();
        }
    }

    private static signAll(flag: Flag, myMemory: MyMemory): void {
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            const name: string = CreepHelper.getName();
            SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.SIGNER, name, "Signer");
            myMemory.empire.creeps.push({
                name: name,
                role: "Signer",
                assignedRoomName: myRoom.name,
                spawningStatus: "queued",
                roomMoveTarget: {
                    pos: null,
                    path: []
                },
                signWords: this.message
            } as Signer);
        }
        ReportController.log("Queued a Signer for all rooms");

        flag.remove();
    }

    private static sign(flag: Flag, myMemory: MyMemory): void {
        let closestDistance: number = 999;
        let closestRoom: MyRoom | null = null;
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            const roomDistance = MapHelper.getRoomDistance(flag.pos.roomName, myRoom.name);
            if (roomDistance < closestDistance) {
                closestRoom = myRoom;
                closestDistance = roomDistance;
            }
        }

        if (closestRoom == null) {
            return;
        }

        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(closestRoom, SpawnConstants.SIGNER, name, "Signer");
        myMemory.empire.creeps.push({
            name: name,
            role: "Signer",
            assignedRoomName: flag.pos.roomName,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            signWords: this.message
        } as Signer);

        ReportController.log("Queued a Signer for room " + LogHelper.roomNameAsLink(flag.pos.roomName));
        flag.remove();
    }
}