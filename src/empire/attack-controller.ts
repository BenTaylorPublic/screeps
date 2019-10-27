import {AttackQuickController} from "./attack-quick-controller";
import {AttackPressureController} from "./attack-pressure-controller";

export class AttackController {
    public static run(empireCommand: EmpireCommand): void {
        //Attack Quick
        let attackQuick: AttackQuick | null = Memory.myMemory.empire.attackQuick;
        if (attackQuick == null) {
            const flag: Flag = Game.flags["attack-quick-rally"];
            if (flag != null) {
                attackQuick = AttackQuickController.setupAttackQuick(flag);
            }
        }

        if (attackQuick != null) {
            AttackQuickController.run(attackQuick, empireCommand);
        }

        //Attack Pressure
        let attackPressure: AttackPressure | null = Memory.myMemory.empire.attackPressure;
        if (attackPressure == null) {
            const flag: Flag = Game.flags["attack-pressure-rally"];
            if (flag != null) {
                attackPressure = AttackPressureController.setupAttackPressure(flag);
            }
        }

        if (attackPressure != null) {
            AttackPressureController.run(attackPressure);
        }
    }
}
