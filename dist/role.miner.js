"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
exports.roleMiner = {
    run: function (miner) {
        const creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("ERR: Miner creep is null. Creep ID: " + miner.name);
            return;
        }
        const cachePos = global_functions_1.globalFunctions.myPosToRoomPos(miner.cachePosToMineOn);
        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source = Game.getObjectById(miner.sourceId);
            if (source == null) {
                console.log("ERR: Miner has been given a source which is null. Creep ID: " + miner.name);
                return;
            }
            creep.harvest(source);
        }
        else {
            //Move to cache
            creep.moveTo(cachePos);
        }
    }
};
