import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack-controller";

export class EmpireController {
    public static run(myMemory: MyMemory): EmpireCommand {

        const empireCommand: EmpireCommand = {
            haltRoomEnergyUsage: false
        };

        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory, empireCommand);

        //Controlling claimers
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const claimer: MyCreep = myMemory.empire.creeps[i];
            if (claimer.role === "Claimer") {
                RoleClaimer.run(claimer as Claimer);
            }
        }

        return empireCommand;
    }
}
