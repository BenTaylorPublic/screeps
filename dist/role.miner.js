"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("global.functions");
class RoleMiner {
    static run(miner) {
        const creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("ERR: Miner creep is null. Creep ID: " + miner.name);
            return;
        }
        if (miner.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, miner.assignedRoomName));
            return;
        }
        const cachePos = global_functions_1.GlobalFunctions.myPosToRoomPos(miner.cachePosToMineOn);
        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source = Game.getObjectById(miner.sourceId);
            if (source == null) {
                console.log("ERR: Miner has been given a source which is null. Creep ID: " + miner.name);
                return;
            }
            creep.harvest(source);
            if (miner.linkIdToDepositTo != null) {
                const link = Game.getObjectById(miner.linkIdToDepositTo);
                if (link == null) {
                    //Setting it to null, so it doesn't do this every loop
                    miner.linkIdToDepositTo = null;
                    console.log("ERR: A miner's link ID to deposit in was null");
                    return;
                }
                creep.transfer(link, RESOURCE_ENERGY);
            }
        }
        else {
            //Move to cache
            creep.moveTo(cachePos);
        }
    }
}
exports.RoleMiner = RoleMiner;
