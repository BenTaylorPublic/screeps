"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiner = {
    run: function (miner) {
        const creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("ERR: Miner creep is null. Creep ID: " + miner.name);
            return;
        }
        const cachePos = new RoomPosition(miner.cachePosToMineOn.x, miner.cachePosToMineOn.y, miner.cachePosToMineOn.roomName);
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
