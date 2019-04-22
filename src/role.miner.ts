import { GlobalFunctions } from "global.functions";

export const roleMiner: any = {
    run: function (miner: Miner) {
        const creep: Creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("ERR: Miner creep is null. Creep ID: " + miner.name);
            return;
        }

        if (miner.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, miner.assignedRoomName));
            return;
        }

        const cachePos: RoomPosition = GlobalFunctions.myPosToRoomPos(miner.cachePosToMineOn);

        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source: Source | null = Game.getObjectById<Source>(miner.sourceId);
            if (source == null) {
                console.log("ERR: Miner has been given a source which is null. Creep ID: " + miner.name);
                return;
            }

            creep.harvest(source);
            if (miner.linkIdToDepositTo != null) {
                const link: StructureLink | null = Game.getObjectById<StructureLink>(miner.linkIdToDepositTo);
                if (link == null) {
                    //Setting it to null, so it doesn't do this every loop
                    miner.linkIdToDepositTo = null;
                    console.log("ERR: A miner's link ID to deposit in was null");
                    return;
                }
                creep.transfer(link, RESOURCE_ENERGY);
            }
        } else {
            //Move to cache
            creep.moveTo(cachePos);
        }

    }
};
