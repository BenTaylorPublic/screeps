import {Constants} from "../../global/constants";

import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";
import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";

export class SpawnStocker {
    public static spawnStocker(myRoom: MyRoom): void {
        if (myRoom.roomStage < 4) {
            //Need bank
            return;
        }

        if ((myRoom.bank as StructureStorage).store.energy < 1250) {
            return;
        }

        let amountOfStockers: number = 0;
        for (let i: number = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Stocker") {
                amountOfStockers++;
            }
        }
        if (amountOfStockers < Constants.MAX_STOCKERS) {
            for (let i: number = 0; i < Constants.MAX_STOCKERS - amountOfStockers; i++) {
                const newCreep: Stocker = this.spawnStockerInternal(myRoom);
                myRoom.myCreeps.push(newCreep);
                ReportController.log("Queued a new Stocker in " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return CreepHelper.generateBody([MOVE, CARRY],
            [MOVE, CARRY],
            Game.rooms[myRoom.name],
            false);
    }

    private static spawnStockerInternal(myRoom: MyRoom): Stocker {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.STOCKER, name, "Stocker");

        return {
            name: name,
            role: "Stocker",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            state: "PickupEnergy"
        };
    }
}