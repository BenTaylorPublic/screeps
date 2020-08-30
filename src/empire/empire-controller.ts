import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack/attack-controller";
import {BuildObserverController} from "./observer/build-observer-controller";
import {ObserverController} from "./observer/observer-controller";
import {PowerBankController} from "./powerBank-controller";
import {SignController} from "./sign/sign-controller";
import {ScavengeController} from "./scavenge-controller";
import {RoleScavenger} from "./role/scavenger";
import {MineralController} from "./mineral-controller";
import {RoomNukerController} from "../room/structures/nuker";

export class EmpireController {
    public static run(myMemory: MyMemory): void {
        this.oddThousandLogic(myMemory);
        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory);

        BuildObserverController.run();
        ObserverController.run(myMemory);
        SignController.run(myMemory);

        MineralController.run(myMemory);

        PowerBankController.run(myMemory);
        ScavengeController.run(myMemory);
        RoomNukerController.checkForNukeLaunchFlags(myMemory.myRooms);

        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const creep: MyCreep = myMemory.empire.creeps[i];
            if (creep.role === "Claimer") {
                RoleClaimer.run(creep as Claimer);
            } else if (creep.role === "Scavenger") {
                RoleScavenger.run(creep as Scavenger);
            } else if (creep.role === "Signer") {
                SignController.runCreep(creep as Signer);
            }
        }
    }

    private static oddThousandLogic(myMemory: MyMemory): void {
        if (Game.time % 1000 === 0) {
            myMemory.empire.oddThousand = !myMemory.empire.oddThousand;
        }
    }
}
