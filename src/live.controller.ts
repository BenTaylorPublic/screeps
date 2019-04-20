import { liveSpawnClaimers } from "live.spawn.claimer";
import { liveSpawnLaborers } from "live.spawn.laborer";

export const liveController: any = {
    run: function (): void {
        liveSpawnClaimers.run();
        liveSpawnLaborers.run();
    }
};
