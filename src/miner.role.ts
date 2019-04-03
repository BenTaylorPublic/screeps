export const minerRole: any = {
    run: function (miner: Miner) {
        if (miner.cacheContainerIdToPutIn == null) {
            console.log("ERR: Miner hasn't been given a cache container id. Creep ID: " + miner.name);
            return;
        }
        const cache: StructureContainer | null = Game.getObjectById<StructureContainer>(miner.cacheContainerIdToPutIn);
        if (cache == null) {
            console.log("ERR: Miner has been given a cache which is null. Creep ID: " + miner.name);
            return;
        }

        const creep: Creep = Game.creeps[miner.name];
        if (creep == null) {
            console.log("ERR: Miner creep is null. Creep ID: " + miner.name);
            return;
        }

        if (cache.pos.isEqualTo(creep.pos)) {
            //In location
            const source: Source | null = Game.getObjectById<Source>(miner.sourceId);
            if (source == null) {
                console.log("ERR: Miner has been given a source which is null. Creep ID: " + miner.name);
                return;
            }

            creep.harvest(source);
        } else {
            //Move to cache
            creep.moveTo(cache);
        }

    }
};
