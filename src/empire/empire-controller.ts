import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack/attack-controller";
import {BuildObserverController} from "./observer/build-observer-controller";
import {ObserverController} from "./observer/observer-controller";
import {PowerBankController} from "./power-bank-controller";
import {SignController} from "./sign/sign-controller";
import {ScavengeController} from "./scavenge-controller";
import {RoleScavenger} from "./role/scavenger";
import {MineralController} from "./mineral-controller";
import {RoomNukerController} from "../room/structures/nuker";
import {RoleLegolas} from "./role/legolas";

export class EmpireController {
    public static run(myMemory: MyMemory): void {
        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory);

        BuildObserverController.run();
        ObserverController.run(myMemory);
        SignController.run(myMemory);

        MineralController.run(myMemory);

        PowerBankController.run(myMemory.empire.powerBanks);
        ScavengeController.run(myMemory);
        RoomNukerController.checkForNukeLaunchFlags(myMemory.myRooms);

        for (const creep of myMemory.empire.creeps) {
            if (creep.role === "Claimer") {
                RoleClaimer.run(creep as Claimer);
            } else if (creep.role === "Scavenger") {
                RoleScavenger.run(creep as Scavenger);
            } else if (creep.role === "Signer") {
                SignController.runCreep(creep as Signer);
            } else if (creep.role === "Legolas") {
                RoleLegolas.run(creep as Legolas);
            }
        }
    }
}
