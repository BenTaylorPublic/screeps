"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_spawn_minerAndWorker_1 = require("room.spawn.minerAndWorker");
const room_spawn_laborer_1 = require("room.spawn.laborer");
const room_spawn_miner_1 = require("room.spawn.miner");
const room_spawn_hauler_1 = require("room.spawn.hauler");
exports.roomSpawnController = {
    run: function (myRoom) {
        let minerAndWorkerCount = 0;
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            if (myRoom.myCreeps[i].role === "MinerAndWorker") {
                minerAndWorkerCount++;
            }
        }
        //Force spawn a miner and worker if there are no creeps alive
        const forceSpawnMinerAndWorkers = myRoom.myCreeps.length === 0;
        if (forceSpawnMinerAndWorkers ||
            (minerAndWorkerCount < 6 && myRoom.roomStage < 2.8)) {
            room_spawn_minerAndWorker_1.roomSpawnMinerAndWorker.trySpawnMinerAndWorker(myRoom);
        }
        else {
            room_spawn_laborer_1.roomSpawnLaborer.trySpawnLaborer(myRoom);
            room_spawn_miner_1.roomSpawnMiner.trySpawnMiner(myRoom);
            room_spawn_hauler_1.roomSpawnHauler.trySpawnHauler(myRoom);
        }
    }
};
