import { global } from "global";

export const roleMiner: any = {
    run: function (miner: Miner) {
        const creep: Creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("ERR: Miner creep is null. Creep ID: " + miner.name);
            return;
        }
        const cachePos: RoomPosition = global.myPosToRoomPos(miner.cachePosToMineOn);

        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source: Source | null = Game.getObjectById<Source>(miner.sourceId);
            if (source == null) {
                console.log("ERR: Miner has been given a source which is null. Creep ID: " + miner.name);
                return;
            }

            creep.harvest(source);
        } else {
            //Move to cache
            creep.moveTo(cachePos);
        }

    }
};
