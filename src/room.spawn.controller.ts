import { roomSpawnLaborer } from "room.spawn.laborer";
import { roomSpawnMiner } from "room.spawn.miner";
import { roomSpawnHauler } from "room.spawn.hauler";

export const roomSpawnController: any = {
    run: function (myRoom: MyRoom) {

        let laborerCount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "Laborer") {
                laborerCount++;
            }
        }

        //Force spawn a miner and worker if there are no creeps alive
        let forceSpawnlaborers: boolean = myRoom.myCreeps.length === 0;
        if (forceSpawnlaborers === false &&
            laborerCount < 2) {
            forceSpawnlaborers = true;
        }

        if (forceSpawnlaborers === false &&
            laborerCount < 6 && myRoom.roomStage < 3) {
            forceSpawnlaborers = true;
        }

        if (forceSpawnlaborers) {
            roomSpawnLaborer.forceSpawnLaborer(myRoom);
        } else {
            roomSpawnLaborer.trySpawnLaborer(myRoom);
            roomSpawnMiner.trySpawnMiner(myRoom);
            roomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
};
