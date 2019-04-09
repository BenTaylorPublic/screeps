"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_spawn_laborer_1 = require("room.spawn.laborer");
const room_spawn_miner_1 = require("room.spawn.miner");
const room_spawn_hauler_1 = require("room.spawn.hauler");
exports.roomSpawnController = {
    run: function (myRoom) {
        let laborerCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "Laborer") {
                laborerCount++;
            }
        }
        //Force spawn a miner and worker if there are no creeps alive
        let forceSpawnlaborers = myRoom.myCreeps.length === 0;
        if (forceSpawnlaborers === false &&
            laborerCount < 4) {
            forceSpawnlaborers = true;
        }
        if (forceSpawnlaborers === false &&
            laborerCount < 6 && myRoom.roomStage < 3) {
            forceSpawnlaborers = true;
        }
        if (forceSpawnlaborers) {
            room_spawn_laborer_1.roomSpawnLaborer.forceSpawnLaborer(myRoom);
        }
        else {
            room_spawn_laborer_1.roomSpawnLaborer.trySpawnLaborer(myRoom);
            room_spawn_miner_1.roomSpawnMiner.trySpawnMiner(myRoom);
            room_spawn_hauler_1.roomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
};
