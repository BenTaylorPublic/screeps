import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RoleMiner {
    public static run(miner: Miner, myRoom: MyRoom): void {
        if (HelperFunctions.handleCreepPreRole(miner)) {
            return;
        }

        const creep: Creep = Game.creeps[miner.name];

        const cachePos: RoomPosition = HelperFunctions.myPosToRoomPos(miner.cachePosToMineOn);

        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source: Source | null = Game.getObjectById<Source>(miner.sourceId);
            if (source == null) {
                ReportController.log("ERROR: Miner has been given a source which is null. Creep ID: " + miner.name + " in " + HelperFunctions.roomNameAsLink(myRoom.name));
                return;
            }

            if (source.energy > 0 &&
                //For the no carry ones
                (creep.store.energy === 0 ||
                    (creep.store.energy <= (creep.store.getCapacity() - miner.amountOfWork * 2)) ||
                    creep.store.getCapacity() === 0)) {

                let mySource: MySource = null as unknown as MySource;
                for (let i: number = 0; i < myRoom.mySources.length; i++) {
                    if (myRoom.mySources[i].minerName === miner.name) {
                        mySource = myRoom.mySources[i];
                    }
                }

                if (!(mySource.state === "Cache" &&
                    mySource.cache != null &&
                    mySource.cache.id != null &&
                    (Game.getObjectById<StructureContainer>(mySource.cache.id) as StructureContainer).store.energy >= 2000)) {
                    creep.harvest(source);
                }
            } else if (miner.linkIdToDepositTo != null &&
                creep.store.energy > (creep.store.getCapacity() - miner.amountOfWork * 2)) {
                const link: StructureLink | null = Game.getObjectById<StructureLink>(miner.linkIdToDepositTo);
                if (link == null) {
                    //Setting it to null, so it doesn't do this every loop
                    miner.linkIdToDepositTo = null;
                    ReportController.log("ERROR: A miner's link ID to deposit in was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    return;
                }
                creep.transfer(link, RESOURCE_ENERGY);
            }
        } else {
            //Move to cache
            HelperFunctions.myMoveTo(creep, cachePos, miner);
        }
    }
}
