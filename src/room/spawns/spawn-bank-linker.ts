import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";
import {HelperFunctions} from "../../global/helper-functions";

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
        console.log("LOG: Queued a BankLinker");
    }

    private static spawnBankLinkerInternal(myRoom: MyRoom): BankLinker {
        const name: string = "Creep" + HelperFunctions.getId();
        SpawnQueueController.queueCreepSpawn([MOVE, CARRY], myRoom, SpawnConstants.BANK_LINKER, name);

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
