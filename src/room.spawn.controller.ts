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
        const forceSpawnlaborers: boolean = myRoom.myCreeps.length === 0;

        if (forceSpawnlaborers ||
            (laborerCount < 6 && myRoom.roomStage < 3)) {
            roomSpawnLaborer.forceSpawnLaborer(myRoom);
        } else {
            roomSpawnLaborer.trySpawnLaborer(myRoom);
            roomSpawnMiner.trySpawnMiner(myRoom);
            roomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
};
