import { RoomSpawnLaborer } from "room.spawn.laborer";
import { RoomSpawnMiner } from "room.spawn.miner";
import { RoomSpawnHauler } from "room.spawn.hauler";
import { Constants } from "constants";

export class RoomSpawnController {
    public static run(myRoom: MyRoom) {

        let laborerCount: number = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "Laborer") {
                laborerCount++;
            }
        }

        //Force spawn a miner and worker if there are no creeps alive
        let forceSpawnlaborers: boolean = false;
        if (laborerCount < Constants.MIN_LABORERS) {
            forceSpawnlaborers = true;
        } else if (laborerCount < Constants.LABORERS_BEFORE_BANK &&
            myRoom.roomStage < 4) {
            //Room stage 4 is when the bank is made
            //After then, haulers will exist
            forceSpawnlaborers = true;
        }

        if (forceSpawnlaborers) {
            RoomSpawnLaborer.forceSpawnLaborer(myRoom);
        } else {
            RoomSpawnLaborer.trySpawnLaborer(myRoom, laborerCount);
            RoomSpawnMiner.trySpawnMiner(myRoom);
            RoomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
}
