import {SpawnLaborer} from "./spawn-laborer";
import {SpawnMiner} from "./spawn-miner";
import {SpawnHauler} from "./spawn-hauler";
import {Constants} from "../../global/constants";
import {SpawnBankLinker} from "./spawn-bank-linker";

export class RoomSpawnController {
    public static run(myRoom: MyRoom): void {

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
            SpawnLaborer.forceSpawnLaborer(myRoom);
        } else {
            SpawnLaborer.trySpawnLaborer(myRoom, laborerCount);
            SpawnMiner.trySpawnMiner(myRoom);
            SpawnHauler.trySpawnHauler(myRoom);
            SpawnBankLinker.run(myRoom);
        }
    }
}
