import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack/attack-controller";
import {BuildObserverController} from "./observer/build-observer-controller";
import {ObserverController} from "./observer/observer-controller";

export class EmpireController {
    public static run(myMemory: MyMemory): void {

        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory);

        BuildObserverController.run(myMemory);
        ObserverController.run(myMemory);

        //Controlling claimers
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const claimer: MyCreep = myMemory.empire.creeps[i];
            if (claimer.role === "Claimer") {
                RoleClaimer.run(claimer as Claimer);
            }
        }
    }
}
