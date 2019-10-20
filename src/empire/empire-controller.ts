import {RoleClaimer} from "./role/claimer";
import {RoleAttackOneCreep} from "./role/attack-one-creep";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackOneController} from "./attack-one-controller";

export class EmpireController {
    public static run(myMemory: MyMemory): EmpireCommand {

        const empireCommand: EmpireCommand = {
            haltRoomEnergyUsage: false
        };

        SpawnClaimerController.run();
        AttackOneController.run(empireCommand);

        //Controlling claimers
        for (let i = 0; i < myMemory.myTravelingCreeps.length; i++) {
            const travelingCreep: MyCreep = myMemory.myTravelingCreeps[i];
            if (travelingCreep.role === "Claimer") {
                RoleClaimer.run(travelingCreep as Claimer);
            }
        }

        if (myMemory.empire.attackOne != null) {
            const attackOne: AttackOne = myMemory.empire.attackOne;
            let flag: Flag;
            if (attackOne.state === "Conscripting" || "Rally") {
                flag = Game.flags["live-attack-one-rally"];
            } else {
                flag = Game.flags["live-attack-one-charge"];
            }

            for (let i = 0; i < attackOne.creeps.length; i++) {
                const attackOneCreep: AttackOneCreep = attackOne.creeps[i];

                RoleAttackOneCreep.run(attackOneCreep, attackOne.state, flag);
            }
        }

        return empireCommand;
    }
}
