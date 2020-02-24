import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack/attack-controller";
import {BuildObserverController} from "./observer/build-observer-controller";
import {ObserverController} from "./observer/observer-controller";
import {PowerScavController} from "./power-scav-controller";
import {RolePowerScavHaulCreep} from "./role/power-scav-haul-creep";

export class EmpireController {
    public static run(myMemory: MyMemory): void {

        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory);

        BuildObserverController.run(myMemory);
        ObserverController.run(myMemory);

        PowerScavController.run(myMemory);

        //Controlling claimers and power scav haulers
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const creep: MyCreep = myMemory.empire.creeps[i];
            if (creep.role === "Claimer") {
                RoleClaimer.run(creep as Claimer);
            } else if (creep.role === "PowerScavHaulCreep") {
                RolePowerScavHaulCreep.run(creep as PowerScavHaulCreep);
            }
        }
    }
}
