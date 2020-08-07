import {FlagHelper} from "../global/helpers/flag-helper";

export class MultishardClaimingController {
    public static run(myMemory: MyMemory): void {
        this.startClaimingProcess();
    }

    public static startClaimingProcess(): void {
        const flag: Flag | null = FlagHelper.getFlag2(["multishard", "claim"]);
        if (flag != null) {
            flag.remove();
        } else {
            return;
        }
        console.log(flag.name);
    }
}