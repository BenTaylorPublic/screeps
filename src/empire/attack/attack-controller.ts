import {AttackQuickController} from "./attack-quick-controller";
import {AttackPressureController} from "./attack-pressure-controller";
import {AttackHealerDrainController} from "./attack-healer-drain-controller";

export class AttackController {
    public static run(myMemory: MyMemory): void {
        //Attack Quick
        const attackQuick: AttackQuick | null = myMemory.empire.attackQuick;
        if (attackQuick == null) {
            const flag: Flag = Game.flags["attack-quick-rally"];
            if (flag != null) {
                myMemory.empire.attackQuick = AttackQuickController.setupAttackQuick(myMemory.myRooms, flag);
            }
        }

        if (attackQuick != null) {
            AttackQuickController.run(myMemory, attackQuick);
        }

        //Attack Pressure
        const attackPressure: AttackPressure | null = myMemory.empire.attackPressure;
        if (attackPressure == null) {
            const flag: Flag = Game.flags["attack-pressure-rally"];
            if (flag != null) {
                myMemory.empire.attackPressure = AttackPressureController.setupAttackPressure(myMemory.myRooms, flag);
            }
        }

        if (attackPressure != null) {
            AttackPressureController.run(myMemory, attackPressure);
        }

        //Attack HealerDrain
        const attackHealerDrain: AttackHealerDrain | null = myMemory.empire.attackHealerDrain;
        if (attackHealerDrain == null) {
            const flag: Flag = Game.flags["attack-healer-drain-rally"];
            if (flag != null) {
                myMemory.empire.attackHealerDrain = AttackHealerDrainController.setupAttackHealerDrain(myMemory.myRooms, flag);
            }
        }

        if (attackHealerDrain != null) {
            AttackHealerDrainController.run(myMemory, attackHealerDrain);
        }
    }
}
