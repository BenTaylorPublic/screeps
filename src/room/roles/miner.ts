import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RoleMiner {
    public static run(miner: Miner, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(miner)) {
            return;
        }

        const creep: Creep = Game.creeps[miner.name];

        const cachePos: RoomPosition = RoomHelper.myPosToRoomPos(miner.cachePosToMineOn);

        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source: Source | null = Game.getObjectById<Source>(miner.sourceId);
            if (source == null) {
                ReportController.email("ERROR: Miner has been given a source which is null. Creep ID: " + miner.name + " in " + LogHelper.roomNameAsLink(myRoom.name));
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
                if (mySource.state !== "Cache") {
                    creep.harvest(source);
                } else if (mySource.cache != null &&
                    mySource.cache.id != null) {
                    const cache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
                    if (cache != null) {
                        if (cache.store.energy < 2000) {
                            creep.harvest(source);
                        }
                    } else {
                        //Clear it
                        mySource.cache.id = null;
                        ReportController.email("ERROR: Source cache returned null with get by ID in " + LogHelper.roomNameAsLink(myRoom.name));
                    }
                }
            } else if (miner.linkIdToDepositTo != null &&
                creep.store.energy > (creep.store.getCapacity() - miner.amountOfWork * 2)) {
                const link: StructureLink | null = Game.getObjectById<StructureLink>(miner.linkIdToDepositTo);
                if (link == null) {
                    //Setting it to null, so it doesn't do this every loop
                    miner.linkIdToDepositTo = null;
                    ReportController.email("ERROR: A miner's link ID to deposit in was null in " + LogHelper.roomNameAsLink(myRoom.name));
                    return;
                }
                creep.transfer(link, RESOURCE_ENERGY);
            }
        } else {
            //Move to cache
            MovementHelper.myMoveTo(creep, cachePos, miner);
        }
    }
}
