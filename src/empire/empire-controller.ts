import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack/attack-controller";
import {BuildObserverController} from "./observer/build-observer-controller";
import {ObserverController} from "./observer/observer-controller";
import {PowerScavengeController} from "./power-scavenge-controller";
import {RolePowerBankScavengeAttackCreep} from "./role/power-bank-scavenge-attack-creep";

export class EmpireController {
    public static run(myMemory: MyMemory): void {

        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory);

        BuildObserverController.run(myMemory);
        ObserverController.run(myMemory);

        PowerScavengeController.run(myMemory);

        //Controlling claimers
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const creep: MyCreep = myMemory.empire.creeps[i];
            if (creep.role === "Claimer") {
                RoleClaimer.run(creep as Claimer);
            } else if (creep.role === "PowerBankScavengeAttackCreep") {
                RolePowerBankScavengeAttackCreep.run(creep as PowerBankScavengeAttackCreep);
            }
        }
    }
}
