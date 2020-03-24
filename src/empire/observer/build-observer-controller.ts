import {ReportController} from "../../reporting/report-controller";

export class BuildObserverController {
    public static run(myMemory: MyMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }

        const flag: Flag | null = Game.flags["observer"];
        if (flag == null) {
            return;
        }

        //Otherwise, make one
        const result: ScreepsReturnCode = flag.pos.createConstructionSite(STRUCTURE_OBSERVER);
        if (result === OK) {
            flag.remove();
        } else {
            ReportController.email("ERROR: Failed to place observer: " + result);
        }
    }
}