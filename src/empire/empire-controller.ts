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
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const claimer: MyCreep = myMemory.empire.creeps[i];
            if (claimer.role === "Claimer") {
                RoleClaimer.run(claimer as Claimer);
            }
        }

        if (myMemory.empire.attackOne != null) {
            const attackOne: AttackOne = myMemory.empire.attackOne;
            let flag: Flag;
            if (attackOne.state === "Conscripting" || "Rally") {
                flag = Game.flags["attack-one-rally"];
            } else {
                flag = Game.flags["attack-one-room-target"];
            }

            for (let i = 0; i < myMemory.empire.creeps.length; i++) {
                const attackOneCreep: AttackOneCreep = myMemory.empire.creeps[i];
                if (attackOneCreep.role !== "AttackOneCreep") {
                    continue;
                }
                console.log(attackOne.state);
                console.log(JSON.stringify(flag));

                RoleAttackOneCreep.run(attackOneCreep as AttackOneCreep, attackOne.state, flag);
            }
        }

        return empireCommand;
    }
}
