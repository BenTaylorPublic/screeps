
import { roomSpawnMinerAndWorker } from "room.spawn.minerAndWorker";
import { roomSpawnLaborer } from "room.spawn.laborer";
import { roomSpawnMiner } from "room.spawn.miner";
import { roomSpawnHauler } from "room.spawn.hauler";

export const roomSpawnController: any = {
    run: function (myRoom: MyRoom) {

        let minerAndWorkerCount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "MinerAndWorker") {
                minerAndWorkerCount++;
            }
        }

        //Force spawn a miner and worker if there are no creeps alive
        const forceSpawnMinerAndWorkers: boolean = myRoom.myCreeps.length === 0;

        if (forceSpawnMinerAndWorkers ||
            (minerAndWorkerCount < 6 && myRoom.roomStage < 3)) {
            roomSpawnMinerAndWorker.trySpawnMinerAndWorker(myRoom);
        } else {
            roomSpawnLaborer.trySpawnLaborer(myRoom);
            roomSpawnMiner.trySpawnMiner(myRoom);
            roomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
};
