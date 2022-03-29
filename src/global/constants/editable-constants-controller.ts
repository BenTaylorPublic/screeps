import {FlagHelper} from "../helpers/flag-helper";
import {ReportController} from "../../reporting/report-controller";

export class EditableConstantsController {
    public static checkForInputFlags(): void {
        this.setOddThousandRepair();
    }

    public static REPAIR_ONLY_ON_ODD_THOUSAND(): boolean {
        return Memory.myMemory.constants.REPAIR_ONLY_ON_ODD_THOUSAND;
    }

    private static setOddThousandRepair(): void {
        const setOtr: Flag[] = FlagHelper.getFlags3(["set", "otr"]);
        if (setOtr.length !== 1) {
            return;
        }
        const flag: Flag = setOtr[0];
        Memory.myMemory.constants.REPAIR_ONLY_ON_ODD_THOUSAND = flag.name.includes("1");
        ReportController.log(`Set REPAIR_ONLY_ON_ODD_THOUSAND to ${Memory.myMemory.constants.REPAIR_ONLY_ON_ODD_THOUSAND}`);
        flag.remove();
    }
}