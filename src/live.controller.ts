import { liveSpawnClaimers } from "live.spawn.claimer";

export const liveController: any = {
    run: function (): void {
        liveSpawnClaimers.run();
    }
};
