import {Constants} from "../../global/constants";
import {HelperFunctions} from "../../global/helper-functions";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

export class SpawnStocker {
    public static spawnStocker(myRoom: MyRoom): void {
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
                console.log("LOG: Queued a new Stocker");
            }
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return HelperFunctions.generateBody([MOVE, CARRY],
            [MOVE, CARRY],
            Game.rooms[myRoom.name],
            false);
    }

    private static spawnStockerInternal(myRoom: MyRoom): Stocker {
        const name: string = "Creep" + HelperFunctions.getId();
        const body: BodyPartConstant[] = this.getBody(myRoom);
        SpawnQueueController.queueCreepSpawn(body, myRoom, SpawnConstants.STOCKER, name);

        return {
            name: name,
            role: "Stocker",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            state: "Pickup"
        };
    }
}