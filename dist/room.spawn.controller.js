"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_spawn_laborer_1 = require("room.spawn.laborer");
const room_spawn_miner_1 = require("room.spawn.miner");
const room_spawn_hauler_1 = require("room.spawn.hauler");
const constants_1 = require("constants");
class RoomSpawnController {
    static run(myRoom) {
        let laborerCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "Laborer") {
                laborerCount++;
            }
        }
        //Force spawn a miner and worker if there are no creeps alive
        let forceSpawnlaborers = false;
        if (laborerCount < constants_1.Constants.MIN_LABORERS) {
            forceSpawnlaborers = true;
        }
        else if (laborerCount < constants_1.Constants.LABORERS_BEFORE_BANK &&
            myRoom.roomStage < 4) {
            //Room stage 4 is when the bank is made
            //After then, haulers will exist
            forceSpawnlaborers = true;
        }
        if (forceSpawnlaborers) {
            room_spawn_laborer_1.RoomSpawnLaborer.forceSpawnLaborer(myRoom);
        }
        else {
            room_spawn_laborer_1.RoomSpawnLaborer.trySpawnLaborer(myRoom, laborerCount);
            room_spawn_miner_1.RoomSpawnMiner.trySpawnMiner(myRoom);
            room_spawn_hauler_1.RoomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
}
exports.RoomSpawnController = RoomSpawnController;
