"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minerRole = {
    run: function (miner) {
        if (miner.cacheContainerIdToPutIn == null) {
            console.log("Miner hasn't been given a cache container id. Creep ID: " + miner.name);
            return;
        }
        const cache = Game.getObjectById(miner.cacheContainerIdToPutIn);
        if (cache == null) {
            console.log("Miner has been given a cache which is null. Creep ID: " + miner.name);
            return;
        }
        const creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("Miner creep is null. Creep ID: " + miner.name);
            return;
        }
        if (cache.pos.isEqualTo(creep.pos)) {
            //In location
            const source = Game.getObjectById(miner.sourceId);
            if (source == null) {
                console.log("Miner has been given a source which is null. Creep ID: " + miner.name);
                return;
            }
            creep.harvest(source);
        }
        else {
            //Move to cache
            creep.moveTo(cache);
        }
    }
};
