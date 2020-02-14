import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {FunctionProfiler} from "../../profiler/function-profiler/function-profiler";

export class RoleMiner {
    public static run(miner: Miner): void {
        FunctionProfiler.startFunction("RoleMiner.Run");
        const creep: Creep = Game.creeps[miner.name];
        if (creep == null) {
            ReportController.log("ERROR", "Miner creep is null. Creep ID: " + miner.name);
            FunctionProfiler.endFunction("RoleMiner.Run");
            return;
        }

        if (miner.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, miner.assignedRoomName));
            FunctionProfiler.endFunction("RoleMiner.Run");
            return;
        }

        const cachePos: RoomPosition = HelperFunctions.myPosToRoomPos(miner.cachePosToMineOn);

        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const source: Source | null = Game.getObjectById<Source>(miner.sourceId);
            if (source == null) {
                ReportController.log("ERROR", "Miner has been given a source which is null. Creep ID: " + miner.name);
                FunctionProfiler.endFunction("RoleMiner.Run");
                return;
            }

            if (source.energy > 0 &&
                creep.carry[RESOURCE_ENERGY] <= (creep.carryCapacity - miner.amountOfWork * 2)) {
                FunctionProfiler.startFunctionSection("RoleMiner.Run", "Mine");
                creep.harvest(source);
                FunctionProfiler.endFunctionSection("RoleMiner.Run", "Mine");
            } else if (miner.linkIdToDepositTo != null &&
                creep.carry[RESOURCE_ENERGY] > (creep.carryCapacity - miner.amountOfWork * 2)) {
                const link: StructureLink | null = Game.getObjectById<StructureLink>(miner.linkIdToDepositTo);
                if (link == null) {
                    //Setting it to null, so it doesn't do this every loop
                    miner.linkIdToDepositTo = null;
                    ReportController.log("ERROR", "A miner's link ID to deposit in was null");
                    FunctionProfiler.endFunction("RoleMiner.Run");
                    return;
                }
                FunctionProfiler.startFunctionSection("RoleMiner.Run", "Transfer");
                creep.transfer(link, RESOURCE_ENERGY);
                FunctionProfiler.endFunctionSection("RoleMiner.Run", "Transfer");
            }
        } else {
            //Move to cache
            creep.moveTo(cachePos);
        }
        FunctionProfiler.endFunction("RoleMiner.Run");
    }
}
