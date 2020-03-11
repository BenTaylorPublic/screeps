import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

import {ReportController} from "../../reporting/report-controller";

export class SpawnBankLinker {
    public static spawnBankLinker(myRoom: MyRoom): void {
        if (myRoom.roomStage < 5) {
            return;
        }
        if (myRoom.bankLinkerName != null) {
            return;
        }
        const bankLinker: BankLinker = this.spawnBankLinkerInternal(myRoom);
        myRoom.myCreeps.push(bankLinker);
        myRoom.bankLinkerName = bankLinker.name;
        ReportController.log("Queued a BankLinker in " + LogHelper.roomNameAsLink(myRoom.name));
    }

    public static getBody(): BodyPartConstant[] {
        return [MOVE, CARRY];
    }

    private static spawnBankLinkerInternal(myRoom: MyRoom): BankLinker {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.BANK_LINKER, name, "BankLinker");

        return {
            name: name,
            role: "BankLinker",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            }
        };
    }
}
