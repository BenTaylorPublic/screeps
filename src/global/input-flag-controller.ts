import {FlagHelper} from "../global/helpers/flag-helper";
import {LogHelper} from "../global/helpers/log-helper";
import {ReportController} from "../reporting/report-controller";

export class InputFlagController {

    public static detectFlagInputs(myMemory: MyMemory): void {
        this.findFlags();
        this.avoidRoomFlags(myMemory.empire);
        this.clearAvoidRoomFlags(myMemory.empire);
    }

    private static avoidRoomFlags(empireMemory: Empire): void {
        const avoidRoomFlags: Flag[] = FlagHelper.getFlags3(["avoid"]);
        if (avoidRoomFlags.length === 0) {
            return;
        }
        for (const avoidRoomFlag of avoidRoomFlags) {
            if (!empireMemory.avoidRoomsManual.includes(avoidRoomFlag.pos.roomName)) {
                ReportController.log("Added " + LogHelper.roomNameAsLink(avoidRoomFlag.pos.roomName) + " to avoid list");
                empireMemory.avoidRoomsManual.push(avoidRoomFlag.pos.roomName);
            }
            avoidRoomFlag.remove();
        }
    }

    private static clearAvoidRoomFlags(empireMemory: Empire): void {
        const avoidRoomFlags: Flag[] = FlagHelper.getFlags3(["clear", "avoid"]);
        if (avoidRoomFlags.length === 0) {
            return;
        }
        empireMemory.avoidRoomsManual = [];
        for (const avoidRoomFlag of avoidRoomFlags) {
            avoidRoomFlag.remove();
        }
        ReportController.log("Cleared avoid list");
    }

    private static findFlags(): void {
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
