import {AttackQuickController} from "./attack-quick-controller";
import {AttackPressureController} from "./attack-pressure-controller";

export class AttackController {
    public static run(myMemory: MyMemory, empireCommand: EmpireCommand): void {
        //Attack Quick
        const attackQuick: AttackQuick | null = myMemory.empire.attackQuick;
        if (attackQuick == null) {
            const flag: Flag = Game.flags["attack-quick-rally"];
            if (flag != null) {
                myMemory.empire.attackQuick = AttackQuickController.setupAttackQuick(myMemory.myRooms, flag);
            }
        }

        if (attackQuick != null) {
            AttackQuickController.run(myMemory, attackQuick, empireCommand);
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
    }
}
