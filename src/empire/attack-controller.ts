import {AttackQuickController} from "./attack-quick-controller";

export class AttackController {
    public static run(empireCommand: EmpireCommand): void {
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
    }
}
