import {FlagHelper} from "../global/helpers/flag-helper";
import {ReportController} from "./report-controller";
import {LogHelper} from "../global/helpers/log-helper";

export class FlagFinderController {
    public static findFlags(): void {
        const findFlagsFlags: Flag[] = FlagHelper.getFlags3(["ff"]);
        if (findFlagsFlags.length === 0) {
            return;
        }
        const findFlagsFlag: Flag = findFlagsFlags[0];

        const stringArrayToSearch: string[] = findFlagsFlag.name
            .replace("ff-", "")
            .split("-");

        findFlagsFlag.remove();

        const flags: Flag[] = FlagHelper.getFlags3(stringArrayToSearch);

        if (flags.length === 0) {
            ReportController.log("No flags found with that search text");
        } else {
            for (const flag of flags) {
                ReportController.log(LogHelper.logFlag(flag));
            }
        }

    }
}
