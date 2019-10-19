import {LiveSpawnClaimer} from "./live-spawn-claimer";
import {LiveAttackOne} from "./live-attack-one";

export class LiveController {
    public static run(): void {
        LiveSpawnClaimer.run();
        LiveAttackOne.run();
    }
}
