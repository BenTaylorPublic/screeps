import {Constants} from "../../global/constants";
import {HelperFunctions} from "../../global/helper-functions";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";
import {ReportController} from "../../reporting/report-controller";

export class SignController {
    public static run(myMemory: MyMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }
        const flag: Flag | null = Game.flags["sign"];
        if (flag == null) {
            return;
        }

        let closestDistance: number = 999;
        let closestRoom: MyRoom | null = null;
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            if (myRoom.roomStage < Constants.POWER_SCAV_ROOM_STAGE) {
                continue;
            }
            const roomDistance = HelperFunctions.getRoomDistance(flag.pos.roomName, myRoom.name);
            if (roomDistance < closestDistance) {
                closestRoom = myRoom;
                closestDistance = roomDistance;
            }
        }

        if (closestRoom == null) {
            return;
        }

        const name: string = "Creep" + HelperFunctions.getId();
        SpawnQueueController.queueCreepSpawn(closestRoom, SpawnConstants.SIGNER, name, "Signer");
        myMemory.empire.creeps.push({
            name: name,
            role: "Signer",
            assignedRoomName: flag.pos.roomName,
            spawningStatus: "queued",
            signWords: "Just a cute lil coder (✿◠‿◠)"
        } as Signer);

        ReportController.log("Queued a Signer for room " + HelperFunctions.roomNameAsLink(flag.pos.roomName));
        flag.remove();
    }

    public static runCreep(signer: Signer): void {
        const creep: Creep = Game.creeps[signer.name];
        if (HelperFunctions.handleCreepPreRole(signer)) {
            return;
        }
        if (creep.room.controller == null) {
            ReportController.email("ERROR: Signer can't sign a room with no controller in " + HelperFunctions.roomNameAsLink(creep.room.name));
            return;
        }
        const signResult = creep.signController(creep.room.controller, signer.signWords);
        if (signResult === ERR_NOT_IN_RANGE) {
            HelperFunctions.myMoveTo(creep, creep.room.controller.pos, signer);
        } else if (signResult === OK) {
            creep.say("dthb4dshnr");
            creep.suicide();
        }
    }
}